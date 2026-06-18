import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();

export interface GalleryImage {
  thumb: string;
  large: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
  alt?: string;
}

interface ManifestSourceFile {
  name?: string;
  outputThumb?: string;
  outputLarge?: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
}

function publicPath(slug: string, filename?: string) {
  return filename ? `/images/galleries/${slug}/${filename}` : "";
}

function fromManifest(slug: string): GalleryImage[] {
  const manifestPath = path.join(root, "public", "images", "galleries", slug, "manifest.json");
  if (!existsSync(manifestPath)) return [];

  try {
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    return (manifest.sourceFiles || [])
      .map((file: ManifestSourceFile) => ({
        thumb: publicPath(slug, file.outputThumb),
        large: publicPath(slug, file.outputLarge),
        width: file.width,
        height: file.height,
        aspectRatio: file.aspectRatio || (file.width && file.height ? file.width / file.height : undefined),
        alt: ""
      }))
      .filter((image: GalleryImage) => image.thumb || image.large);
  } catch {
    return [];
  }
}

function fromFolder(slug: string): GalleryImage[] {
  const galleryDir = path.join(root, "public", "images", "galleries", slug);
  if (!existsSync(galleryDir)) return [];

  const files = readdirSync(galleryDir).filter((file) => file.endsWith(".webp")).sort();
  const groups = new Map<string, { thumb?: string; large?: string }>();
  for (const file of files) {
    const key = file.replace(/-(thumb|large)\.webp$/, "").replace(/\.webp$/, "");
    const group = groups.get(key) || {};
    if (file.includes("-thumb.webp")) group.thumb = file;
    else if (file.includes("-large.webp")) group.large = file;
    else group.large = file;
    groups.set(key, group);
  }

  return [...groups.values()]
    .map((group) => ({
      thumb: publicPath(slug, group.thumb || group.large),
      large: publicPath(slug, group.large || group.thumb),
      aspectRatio: 1.5,
      alt: ""
    }))
    .filter((image) => image.thumb || image.large);
}

export function getGalleryImages(slug: string, frontmatterImages: GalleryImage[] = []) {
  if (frontmatterImages.length > 0) return frontmatterImages;
  const manifestImages = fromManifest(slug);
  if (manifestImages.length > 0) return manifestImages;
  return fromFolder(slug);
}

export function getGalleryCover(slug: string, coverImage?: string, frontmatterImages: GalleryImage[] = []) {
  const images = getGalleryImages(slug, frontmatterImages);
  return coverImage || images[0]?.large || images[0]?.thumb || "";
}
