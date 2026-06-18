import { createHash, randomBytes } from "node:crypto";
import { createServer } from "node:http";
import { Buffer } from "node:buffer";
import { readFileSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";
import { processBufferToTemp, processGalleryImages } from "./lib/image-processor.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const host = "127.0.0.1";
const port = 4174;
const authDir = path.join(root, ".google-auth");
const tempDir = path.join(root, ".portfolio-auth", "downloads");
const tokenPath = path.join(authDir, "token.json");
const pickerEndpoint = "https://photospicker.googleapis.com";
const googleScope = "https://www.googleapis.com/auth/photospicker.mediaitems.readonly";
const redirectUri = `http://${host}:${port}/oauth2callback`;

let oauthState = null;
let codeVerifier = null;

function readEnv() {
  const env = { ...process.env };
  try {
    const text = readFileSync(path.join(root, ".env"), "utf8");
    for (const line of text.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (match && env[match[1]] === undefined) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  } catch {
    // .env is optional.
  }
  return env;
}

const env = readEnv();
const googleClientId = env.GOOGLE_CLIENT_ID || "";
const googleClientSecret = env.GOOGLE_CLIENT_SECRET || "";

function send(res, status, body, headers = {}) {
  const payload = typeof body === "string" ? body : JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": typeof body === "string" ? "text/html; charset=utf-8" : "application/json; charset=utf-8",
    ...headers
  });
  res.end(payload);
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

function base64Url(buffer) {
  return buffer.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function codeChallenge(verifier) {
  return base64Url(createHash("sha256").update(verifier).digest());
}

async function saveToken(token) {
  await mkdir(authDir, { recursive: true });
  await writeFile(tokenPath, JSON.stringify({ ...token, savedAt: Date.now() }, null, 2));
}

async function loadToken() {
  return JSON.parse(await readFile(tokenPath, "utf8"));
}

async function googleFetch(url, options = {}) {
  const token = await loadToken();
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token.access_token}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
  if (!response.ok) {
    const text = await response.text();
    let details = null;
    try {
      details = JSON.parse(text);
    } catch {
      details = { error: text };
    }
    const error = new Error(`Google API failed: ${response.status}`);
    error.status = response.status;
    error.details = details;
    throw error;
  }
  return response.json();
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function validateSavePayload(payload) {
  const errors = [];
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(payload.slug || "")) errors.push("slug must be lowercase kebab-case.");
  if (!Array.isArray(payload.images) || payload.images.length === 0) errors.push("At least one image is required.");

  return errors;
}

function galleryMarkdown(payload) {
  const body = payload.body?.trim() || payload.description?.trim() || "Curated public selection from this photography project.";
  const safeTitle = payload.title?.trim() || payload.slug || "Untitled gallery";
  const safeDate = /^\d{4}-\d{2}-\d{2}$/.test(payload.date || "") ? payload.date : new Date().toISOString().slice(0, 10);
  const safeSection = ["corporate-events", "content", "portraits", "personal"].includes(payload.section) ? payload.section : "corporate-events";
  const safeClientVisibility = ["public", "confidential", "hidden"].includes(payload.clientVisibility) ? payload.clientVisibility : "hidden";
  const safePublishStatus = ["draft", "published", "archived"].includes(payload.publishStatus) ? payload.publishStatus : "published";
  const frontmatter = {
    title: safeTitle,
    slug: payload.slug,
    date: safeDate,
    category: payload.category?.trim() || "Photography",
    section: safeSection,
    venue: payload.venue || undefined,
    client: payload.client || undefined,
    clientVisibility: safeClientVisibility,
    featured: Boolean(payload.featured),
    publishStatus: safePublishStatus,
    summary: payload.summary || undefined,
    description: payload.description || undefined,
    services: payload.services || [],
    tags: payload.tags || [],
    googlePhotosUrl: payload.googlePhotosUrl || "",
    testimonial: payload.testimonial || undefined,
    coverImage: payload.coverImage,
    images: payload.images
  };

  return `---\n${YAML.stringify(frontmatter).trim()}\n---\n\n${body}\n`;
}

async function handleAuthStart(res) {
  if (!googleClientId) {
    send(res, 400, { error: "Missing GOOGLE_CLIENT_ID in .env." });
    return;
  }
  oauthState = base64Url(randomBytes(24));
  codeVerifier = base64Url(randomBytes(64));
  const params = new URLSearchParams({
    client_id: googleClientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: googleScope,
    state: oauthState,
    code_challenge: codeChallenge(codeVerifier),
    code_challenge_method: "S256",
    access_type: "offline",
    prompt: "consent"
  });
  res.writeHead(302, { Location: `https://accounts.google.com/o/oauth2/v2/auth?${params}` });
  res.end();
}

async function handleOAuthCallback(url, res) {
  if (url.searchParams.get("state") !== oauthState) {
    send(res, 400, "OAuth state mismatch.");
    return;
  }
  const code = url.searchParams.get("code");
  const params = new URLSearchParams({
    client_id: googleClientId,
    code,
    code_verifier: codeVerifier,
    grant_type: "authorization_code",
    redirect_uri: redirectUri
  });
  if (googleClientSecret) {
    params.set("client_secret", googleClientSecret);
  }
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params
  });
  const token = await response.json();
  if (!response.ok) {
    const secretHint =
      token.error_description === "client_secret is missing."
        ? `<p><strong>Fix:</strong> your Google OAuth client is probably a Web application client. Add <code>GOOGLE_CLIENT_SECRET</code> to <code>.env</code>, or create a Desktop app OAuth client and use that Client ID instead.</p>`
        : "";
    send(res, 400, `${secretHint}<pre>${JSON.stringify(token, null, 2)}</pre>`);
    return;
  }
  await saveToken(token);
  send(res, 200, "<p>Google Photos connected. You can return to the importer window.</p>");
}

async function createPickerSession(res) {
  const session = await googleFetch(`${pickerEndpoint}/v1/sessions`, { method: "POST", body: "{}" });
  send(res, 200, session);
}

async function getPickerSession(id, res) {
  const session = await googleFetch(`${pickerEndpoint}/v1/sessions/${encodeURIComponent(id)}`);
  send(res, 200, session);
}

async function listMediaItems(url, res) {
  const params = new URLSearchParams();
  params.set("sessionId", url.searchParams.get("sessionId") || "");
  if (url.searchParams.get("pageToken")) params.set("pageToken", url.searchParams.get("pageToken"));
  try {
    const data = await googleFetch(`${pickerEndpoint}/v1/mediaItems?${params}`);
    send(res, 200, data);
  } catch (error) {
    const reason = error.details?.error?.details?.find?.((detail) => detail.reason)?.reason;
    if (error.status === 400 && reason === "PENDING_USER_ACTION") {
      send(res, 202, {
        pending: true,
        reason,
        message: "No media has been picked yet. Finish selecting images in the Google Photos Picker window, then click Load selected media again."
      });
      return;
    }
    send(res, error.status || 500, {
      error: error.message,
      details: error.details || null
    });
  }
}

function mediaDownloadUrl(item) {
  const baseUrl = item?.mediaFile?.baseUrl || item?.baseUrl;
  if (!baseUrl) throw new Error(`Missing downloadable baseUrl for ${item?.id || item?.filename || "media item"}.`);
  return `${baseUrl}=d`;
}

async function downloadAndProcess(payload, res) {
  const slug = slugify(payload.slug || payload.title);
  if (!slug) throw new Error("A slug or title is required before importing.");
  await rm(tempDir, { recursive: true, force: true });
  await mkdir(tempDir, { recursive: true });

  const sources = [];
  const token = await loadToken();
  for (const [index, item] of payload.mediaItems.entries()) {
    const response = await fetch(mediaDownloadUrl(item), {
      headers: { Authorization: `Bearer ${token.access_token}` }
    });
    if (!response.ok) throw new Error(`Download failed for item ${index + 1}: ${response.status}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    const tempPath = path.join(tempDir, `source-${String(index + 1).padStart(3, "0")}`);
    await processBufferToTemp(buffer, tempPath);
    sources.push(tempPath);
  }

  const result = await processGalleryImages({
    root,
    slug,
    sources,
    altTexts: payload.altTexts || [],
    coverIndex: payload.coverIndex || 0,
    clean: true
  });

  send(res, 200, { slug, ...result });
}

async function saveGallery(payload, res) {
  const errors = validateSavePayload(payload);
  const outputPath = path.join(root, "src", "content", "photography", `${payload.slug}.md`);
  try {
    await readFile(outputPath, "utf8");
    errors.push(`A gallery already exists at src/content/photography/${payload.slug}.md.`);
  } catch {
    // Expected for new galleries.
  }
  if (errors.length) {
    send(res, 400, { errors });
    return;
  }
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, galleryMarkdown(payload));
  send(res, 200, {
    ok: true,
    path: `src/content/photography/${payload.slug}.md`,
    message: "Gallery Markdown saved. Restart npm run dev if Astro does not show the new gallery immediately."
  });
}

async function importerHtml() {
  return readFile(path.join(root, "importer", "public", "index.html"), "utf8");
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${host}:${port}`);
    if (req.method === "GET" && url.pathname === "/") return send(res, 200, await importerHtml());
    if (req.method === "GET" && url.pathname === "/api/config") {
      return send(res, 200, {
        hasClientId: Boolean(googleClientId),
        hasClientSecret: Boolean(googleClientSecret),
        redirectUri,
        scope: googleScope
      });
    }
    if (req.method === "GET" && url.pathname === "/auth/start") return handleAuthStart(res);
    if (req.method === "GET" && url.pathname === "/oauth2callback") return handleOAuthCallback(url, res);
    if (req.method === "POST" && url.pathname === "/api/picker/session") return createPickerSession(res);
    if (req.method === "GET" && url.pathname.startsWith("/api/picker/session/")) {
      return getPickerSession(url.pathname.split("/").pop(), res);
    }
    if (req.method === "GET" && url.pathname === "/api/picker/media") return listMediaItems(url, res);
    if (req.method === "POST" && url.pathname === "/api/import") return downloadAndProcess(await readJson(req), res);
    if (req.method === "POST" && url.pathname === "/api/save") return saveGallery(await readJson(req), res);
    send(res, 404, { error: "Not found" });
  } catch (error) {
    console.error(error);
    send(res, 500, { error: error.message, details: error.details || null });
  }
});

server.listen(port, host, () => {
  console.log(`Portfolio importer running at http://${host}:${port}`);
});
