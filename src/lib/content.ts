import type { CollectionEntry } from "astro:content";

export type PhotographyEntry = CollectionEntry<"photography">;
export type DataProjectEntry = CollectionEntry<"data-projects">;
export type ContentWorkEntry = CollectionEntry<"content-work">;
export type PhotographyType = PhotographyEntry["data"]["photographyType"];

export function published<T extends { data: { publishStatus?: string; date?: Date } }>(items: T[]) {
  return items
    .filter((item) => item.data.publishStatus !== "draft" && item.data.publishStatus !== "archived")
    .sort((a, b) => safeDate(b.data.date).getTime() - safeDate(a.data.date).getTime());
}

export function featured<T extends { data: { featured?: boolean } }>(items: T[], limit = 2) {
  const featuredItems = items.filter((item) => item.data.featured);
  return (featuredItems.length ? featuredItems : items).slice(0, limit);
}

export function rankPhotographyForAll(items: PhotographyEntry[]) {
  return sortByRank(items, "featuredRank");
}

export function rankPhotographyForCategory(items: PhotographyEntry[]) {
  return sortByRank(items, "categoryRank");
}

export function galleryUrl(item: PhotographyEntry) {
  return `/photography/gallery/${entrySlug(item)}/`;
}

export function photographyTypeLabel(item: PhotographyEntry) {
  return photographyTypeName(item.data.photographyType);
}

export function photographyTypeName(type: PhotographyType) {
  const labels: Record<PhotographyType, string> = {
    "corporate-private-events": "Corporate & private events",
    "stage-work": "Stage work",
    photoshoot: "Photoshoot",
    "wedding-rom": "Wedding & ROM"
  };

  return labels[type] || "Photography";
}

export function projectUrl(item: DataProjectEntry) {
  return `/data/project/${entrySlug(item)}/`;
}

export function entrySlug(item: PhotographyEntry | DataProjectEntry | ContentWorkEntry) {
  return item.id.replace(/\.(md|mdx)$/, "");
}

export function displayTitle(item: PhotographyEntry | ContentWorkEntry, fallback = "Untitled") {
  const data = item.data as { title?: string; generatedTitle?: string };
  return cleanTitle(data.title) || cleanTitle(data.generatedTitle) || humanizeSlug(entrySlug(item)) || fallback;
}

export function formatDate(date: Date) {
  const safe = safeDate(date);
  if (safe.getTime() === 0) return "";
  return new Intl.DateTimeFormat("en-SG", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(safe);
}

export function clientLabel(item: PhotographyEntry) {
  if (item.data.clientVisibility === "hidden") return "";
  if (item.data.clientVisibility === "confidential") return "Confidential client";
  return item.data.client || "";
}

export function safeDate(value: unknown) {
  const date = value instanceof Date ? value : new Date(String(value || ""));
  return Number.isNaN(date.getTime()) ? new Date(0) : date;
}

function cleanTitle(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function sortByRank(items: PhotographyEntry[], rankKey: "featuredRank" | "categoryRank") {
  return items
    .map((item, originalIndex) => ({ item, originalIndex }))
    .sort((a, b) => {
      const rankDifference = a.item.data[rankKey] - b.item.data[rankKey];
      return rankDifference || a.originalIndex - b.originalIndex;
    })
    .map(({ item }) => item);
}

function humanizeSlug(slug: string) {
  return slug
    .replace(/\.(md|mdx)$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
