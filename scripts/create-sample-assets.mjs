import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const photoSets = [
  {
    slug: "ai-business-conference",
    ratios: [1.5, 0.72, 1.5, 1.33, 0.75, 1.5],
    colors: ["#d8c3a5", "#786f63", "#c0ccd0", "#ece4d8", "#8a7354", "#aab7b8"]
  },
  {
    slug: "technology-leadership-session",
    ratios: [1.5, 0.72, 1.33, 0.75],
    colors: ["#1f201d", "#8a7354", "#c0ccd0", "#786f63"]
  }
];

function dimensionsForRatio(ratio) {
  if (ratio >= 1) {
    return { width: 2800, height: Math.round(2800 / ratio) };
  }
  return { width: Math.round(2800 * ratio), height: 2800 };
}

function svg({ width, height, color, index, slug }) {
  const label = slug.replaceAll("-", " ");
  return Buffer.from(`
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${color}"/>
          <stop offset="1" stop-color="#f7f3eb"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#g)"/>
      <circle cx="${width * 0.78}" cy="${height * 0.24}" r="${Math.min(width, height) * 0.18}" fill="rgba(255,250,241,0.24)"/>
      <rect x="${width * 0.08}" y="${height * 0.68}" width="${width * 0.56}" height="${height * 0.12}" rx="${height * 0.025}" fill="rgba(23,22,21,0.18)"/>
      <text x="${width * 0.08}" y="${height * 0.9}" fill="rgba(23,22,21,0.58)" font-family="Arial, sans-serif" font-size="${Math.max(42, width * 0.035)}" font-weight="700">${label} ${index}</text>
    </svg>
  `);
}

async function writePhotoSet(set) {
  const dir = path.join(root, "public", "images", "galleries", set.slug);
  await mkdir(dir, { recursive: true });
  for (const [index, ratio] of set.ratios.entries()) {
    const number = String(index + 1).padStart(3, "0");
    const size = dimensionsForRatio(ratio);
    const input = svg({ ...size, color: set.colors[index], index: index + 1, slug: set.slug });
    await sharp(input)
      .resize({ width: 480, height: 480, fit: "inside" })
      .webp({ quality: 80 })
      .toFile(path.join(dir, `image-${number}-thumb.webp`));
    await sharp(input)
      .webp({ quality: 86 })
      .toFile(path.join(dir, `image-${number}-large.webp`));
  }
}

async function writeDataCover(slug, color) {
  const dir = path.join(root, "public", "images", "data", slug);
  await mkdir(dir, { recursive: true });
  const input = svg({ width: 1800, height: 1200, color, index: 1, slug });
  await sharp(input).webp({ quality: 86 }).toFile(path.join(dir, "cover.webp"));
}

for (const set of photoSets) await writePhotoSet(set);
await writeDataCover("photo-business-dashboard", "#dfe8e5");
await writeDataCover("event-lead-tracker", "#ece4d8");

await writeFile(path.join(root, "public", "images", ".generated-samples"), "Generated sample portfolio assets.\n");
console.log("Sample WebP assets generated.");
