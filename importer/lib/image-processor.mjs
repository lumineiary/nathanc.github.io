import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

export const imageDefaults = {
  thumbLongEdge: 480,
  largeLongEdge: 2800,
  thumbQuality: 80,
  largeQuality: 86
};

export function galleryImageDir(root, slug) {
  return path.join(root, "public", "images", "galleries", slug);
}

export function publicGalleryPath(slug, filename) {
  return `/images/galleries/${slug}/${filename}`;
}

async function hasGpsMetadata(inputPath) {
  try {
    const metadata = await sharp(inputPath).metadata();
    const exif = metadata.exif ? metadata.exif.toString("latin1") : "";
    return /GPS|GPSLatitude|GPSLongitude/i.test(exif);
  } catch {
    return false;
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

export async function processGalleryImages({ root, slug, sources, altTexts = [], coverIndex = 0, clean = false }) {
  const outputDir = galleryImageDir(root, slug);
  if (clean) await rm(outputDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });

  const images = [];
  let gpsDetected = false;

  for (const [index, source] of sources.entries()) {
    const number = String(index + 1).padStart(3, "0");
    const thumbName = `image-${number}-thumb.webp`;
    const largeName = `image-${number}-large.webp`;
    const thumbPath = path.join(outputDir, thumbName);
    const largePath = path.join(outputDir, largeName);

    if (await hasGpsMetadata(source)) gpsDetected = true;

    await writeWebp(source, thumbPath, imageDefaults.thumbLongEdge, imageDefaults.thumbQuality);
    const large = await writeWebp(source, largePath, imageDefaults.largeLongEdge, imageDefaults.largeQuality);

    images.push({
      thumb: publicGalleryPath(slug, thumbName),
      large: publicGalleryPath(slug, largeName),
      width: large.width,
      height: large.height,
      aspectRatio: Number((large.width / large.height).toFixed(4)),
      alt: altTexts[index] || ""
    });
  }

  return {
    images,
    gpsDetected,
    coverImage: images[coverIndex]?.large || images[0]?.large || ""
  };
}

export async function processBufferToTemp(buffer, tempPath) {
  await mkdir(path.dirname(tempPath), { recursive: true });
  await writeFile(tempPath, buffer);
  return tempPath;
}

export async function readSourceBuffer(sourcePath) {
  return readFile(sourcePath);
}
