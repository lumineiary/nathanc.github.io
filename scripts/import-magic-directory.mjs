import { mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import sharp from "sharp";
import YAML from "yaml";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const inboxRoot = path.join(root, "inbox", "galleries");
const contentRoot = path.join(root, "src", "content", "photography");
const outputRoot = path.join(root, "public", "images", "galleries");
const supportedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);
let promptInterface;

const thumbLongEdge = 480;
const largeLongEdge = 2800;

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function listGalleryFolders() {
  if (!(await exists(inboxRoot))) {
    await mkdir(inboxRoot, { recursive: true });
    return [];
  }
  const entries = await readdir(inboxRoot, { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
}

async function listSourceImages(folderPath) {
  const entries = await readdir(folderPath, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && supportedExtensions.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));
}

async function readGalleryMarkdown(folderPath) {
  const galleryMdPath = path.join(folderPath, "gallery.md");
  if (!(await exists(galleryMdPath))) {
    return promptForGalleryMarkdown(folderPath, galleryMdPath, matter("---\n---\n"), {
      reason: "No gallery.md found, so let's create one."
    });
  }

  const parsed = matter(await readFile(galleryMdPath, "utf8"));
  if (!String(parsed.data?.guidedContext || "").trim()) {
    return promptForGalleryMarkdown(folderPath, galleryMdPath, parsed, {
      reason: "gallery.md exists, but it has no guidedContext."
    });
  }

  return parsed;
}

async function promptForGalleryMarkdown(folderPath, galleryMdPath, parsed, { reason }) {
  const folderName = path.basename(folderPath);
  const existingData = parsed.data || {};

  if (!input.isTTY || !output.isTTY) {
    throw new Error(
      [
        `Gallery "${folderName}" needs mandatory context before import.`,
        reason,
        "Run `npm run import:magic` locally in an interactive terminal so the importer can ask for details,",
        "or edit gallery.md manually with at least:",
        "---",
        "guidedContext: Your mandatory context here.",
        "---"
      ].join("\n")
    );
  }

  const prompt = getPromptInterface();
  console.log(`\nNew gallery detected: ${folderName}`);
  console.log(reason);

  let title = String(existingData.title || "").trim();
  if (!title && !String(existingData.generatedTitle || "").trim()) {
    title = (await prompt.question("Title (optional, press Enter to let AI generate one): ")).trim();
  }

  let guidedContext = String(existingData.guidedContext || "").trim();

  while (!guidedContext) {
    guidedContext = (await prompt.question("Context (mandatory, used for AI title/description): ")).trim();
    if (!guidedContext) {
      console.log("Context is required. Add the useful facts, angle, client value, event type, or moments to highlight.");
    }
  }

  const data = cleanFrontmatter({
    ...existingData,
    title: title || existingData.title || undefined,
    photographyType: existingData.photographyType || "corporate-private-events",
    publishStatus: existingData.publishStatus || "published",
    guidedContext
  });
  const yaml = YAML.stringify(data).trim();
  const raw = `---\n${yaml}\n---\n\n${parsed.content.trim()}\n`;
  await writeFile(galleryMdPath, raw);
  console.log(`Updated ${path.relative(root, galleryMdPath)}\n`);

  return matter(raw);
}

function getPromptInterface() {
  if (!promptInterface) {
    promptInterface = createInterface({ input, output });
  }
  return promptInterface;
}

async function readManifest(manifestPath) {
  try {
    return JSON.parse(await readFile(manifestPath, "utf8"));
  } catch {
    return { sourceFiles: [] };
  }
}

async function writeWebp(inputPath, outputPath, longEdge, quality) {
  const result = await sharp(inputPath)
    .rotate()
    .toColorspace("srgb")
    .resize({
      width: longEdge,
      height: longEdge,
      fit: "inside",
      withoutEnlargement: true
    })
    .webp({ quality })
    .toBuffer({ resolveWithObject: true });

  await writeFile(outputPath, result.data);
  return result.info;
}

async function processGallery({ folderName, folderPath }) {
  const slug = slugify(folderName);
  if (!slug) {
    console.warn(`Skipping "${folderName}" because it cannot be slugified.`);
    return;
  }

  const sourceImages = await listSourceImages(folderPath);
  if (sourceImages.length === 0) {
    console.warn(`Skipping "${folderName}" because it has no supported images.`);
    return;
  }

  const outputDir = path.join(outputRoot, slug);
  const manifestPath = path.join(outputDir, "manifest.json");
  const oldManifest = await readManifest(manifestPath);
  const oldByName = new Map((oldManifest.sourceFiles || []).map((file) => [file.name, file]));
  const newManifest = {
    generatedAt: new Date().toISOString(),
    sourceFiles: []
  };

  await mkdir(outputDir, { recursive: true });

  for (const [index, sourceName] of sourceImages.entries()) {
    const sourcePath = path.join(folderPath, sourceName);
    const sourceStat = await stat(sourcePath);
    const number = String(index + 1).padStart(3, "0");
    const outputThumb = `image-${number}-thumb.webp`;
    const outputLarge = `image-${number}-large.webp`;
    const thumbPath = path.join(outputDir, outputThumb);
    const largePath = path.join(outputDir, outputLarge);
    const existing = oldByName.get(sourceName);

    let width = existing?.width;
    let height = existing?.height;
    let aspectRatio = existing?.aspectRatio;
    const canReuse =
      existing &&
      existing.size === sourceStat.size &&
      existing.mtimeMs === sourceStat.mtimeMs &&
      existing.outputThumb === outputThumb &&
      existing.outputLarge === outputLarge &&
      (await exists(thumbPath)) &&
      (await exists(largePath)) &&
      width &&
      height;

    if (!canReuse) {
      await writeWebp(sourcePath, thumbPath, thumbLongEdge, 80);
      const large = await writeWebp(sourcePath, largePath, largeLongEdge, 86);
      width = large.width;
      height = large.height;
      aspectRatio = Number((large.width / large.height).toFixed(4));
    }

    newManifest.sourceFiles.push({
      name: sourceName,
      mtimeMs: sourceStat.mtimeMs,
      size: sourceStat.size,
      outputThumb,
      outputLarge,
      width,
      height,
      aspectRatio
    });
  }

  await removeStaleOutputs(outputDir, newManifest);
  await writeFile(manifestPath, `${JSON.stringify(newManifest, null, 2)}\n`);
  await writeGalleryContent({ folderPath, slug, manifest: newManifest });
  console.log(`Imported ${sourceImages.length} image(s): ${slug}`);
}

async function removeStaleOutputs(outputDir, manifest) {
  const keep = new Set(["manifest.json"]);
  for (const file of manifest.sourceFiles) {
    keep.add(file.outputThumb);
    keep.add(file.outputLarge);
  }

  const entries = await readdir(outputDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (!entry.name.endsWith(".webp")) continue;
    if (!keep.has(entry.name)) {
      await rm(path.join(outputDir, entry.name), { force: true });
    }
  }
}

async function writeGalleryContent({ folderPath, slug, manifest }) {
  const parsed = await readGalleryMarkdown(folderPath);
  const data = parsed.data || {};
  const contentPath = path.join(contentRoot, `${slug}.md`);
  const existing = await readExistingContent(contentPath);
  const first = manifest.sourceFiles[0];

  const frontmatter = cleanFrontmatter({
    title: data.title || undefined,
    generatedTitle: data.generatedTitle || existing.data.generatedTitle || undefined,
    date: data.date || new Date().toISOString().slice(0, 10),
    category: data.category || "Photography",
    section: data.section || "corporate-events",
    photographyType: data.photographyType || "corporate-private-events",
    client: data.client || undefined,
    clientVisibility: data.clientVisibility || "hidden",
    featured: data.featured === true || data.featured === "true",
    publishStatus: data.publishStatus || "published",
    summary: data.summary || existing.data.summary || undefined,
    description: data.description || undefined,
    guidedContext: data.guidedContext || undefined,
    platformCaption: data.platformCaption || undefined,
    autoSummary: data.autoSummary === false || data.autoSummary === "false" ? false : undefined,
    services: Array.isArray(data.services) ? data.services : undefined,
    tags: Array.isArray(data.tags) ? data.tags : undefined,
    googlePhotosUrl: data.googlePhotosUrl || undefined,
    coverImage: data.coverImage || (first ? `/images/galleries/${slug}/${first.outputLarge}` : undefined)
  });

  await mkdir(contentRoot, { recursive: true });
  const yaml = YAML.stringify(frontmatter).trim();
  const body = parsed.content.trim() || existing.content.trim();
  await writeFile(
    contentPath,
    `---\n# photographyType choices: corporate-private-events | stage-work | photoshoot | wedding-rom\n${yaml}\n---\n\n${body}\n`
  );
}

async function readExistingContent(contentPath) {
  try {
    return matter(await readFile(contentPath, "utf8"));
  } catch {
    return { data: {}, content: "" };
  }
}

function cleanFrontmatter(frontmatter) {
  return Object.fromEntries(Object.entries(frontmatter).filter(([, value]) => value !== undefined && value !== ""));
}

const folders = await listGalleryFolders();
if (folders.length === 0) {
  console.log("No magic-directory galleries found in inbox/galleries.");
}

for (const folderName of folders) {
  await processGallery({
    folderName,
    folderPath: path.join(inboxRoot, folderName)
  });
}

if (promptInterface) {
  promptInterface.close();
}
