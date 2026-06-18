# Photographer + Data Analyst Portfolio Website

Astro-powered static portfolio for photography and data analyst work.

The public site is fully static and deploys to GitHub Pages or Cloudflare Pages. The importer is a local-only tool for turning selected Google Photos images into local WebP portfolio assets and Markdown gallery files.

The preferred gallery workflow is now the magic directory importer: drop a folder of images into `inbox/galleries/`, run one command, and the site generates clean Markdown plus local WebP assets.

## Commands

```bash
npm install
npm run dev
npm run validate
npm run build
npm run preview
npm run import
npm run import:magic
```

Generate placeholder WebP assets for the bundled sample content:

```bash
npm run sample-assets
```

## Content

Photography galleries live in:

```text
src/content/photography/[slug].md
```

Data projects live in:

```text
src/content/data-projects/[slug].mdx
```

Only content with:

```yaml
publishStatus: "published"
```

appears in production listings, related galleries, homepage cards, and `sitemap.xml`.

## Google Photos Importer

Create a `.env` file locally:

```text
GOOGLE_CLIENT_ID=your-google-oauth-client-id
```

Recommended OAuth client type:

```text
Desktop app
```

If you created a Web application OAuth client instead, also add:

```text
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
```

Then run:

```bash
npm run import
```

Open:

```text
http://127.0.0.1:4174
```

The importer uses Google OAuth 2.0 with PKCE, opens a Google Photos Picker session, downloads selected media locally, generates two WebP files per image, and saves a Markdown gallery.

Generated gallery images are stored under:

```text
public/images/galleries/[slug]/
```

The importer is not deployed publicly.

## Magic Directory Gallery Workflow

Create one folder per gallery:

```text
inbox/galleries/my-event/
  gallery.md
  DSC001.jpg
  DSC002.jpg
  DSC003.webp
```

The smallest useful `gallery.md` is:

```md
---
title: My Event
---

Optional write-up here.
```

If `gallery.md` is missing, the importer creates a starter file using the folder name.

Run:

```bash
npm run import:magic
```

The importer will:

- process `.jpg`, `.jpeg`, `.png`, and `.webp` files
- create 480px long-edge thumbnail WebPs
- create 2800px long-edge large WebPs
- strip image metadata during processing
- write generated images to `public/images/galleries/[slug]/`
- write `manifest.json` for fast repeat imports
- create or update `src/content/photography/[slug].md`

Generated Markdown stays intentionally simple. It does not need an explicit `images:` list; the site reads gallery images from `public/images/galleries/[slug]/manifest.json`.

Raw inbox images are ignored by Git:

```text
inbox/
```

Commit the generated Markdown files, generated WebP files, and `manifest.json` files. That keeps the published site portable without committing original camera JPEGs.

`npm run build` runs the magic importer automatically before building, but `npm run import:magic` is still the clearest command when you are actively adding a gallery.

## Deployment

GitHub Pages uses:

```text
.github/workflows/deploy-pages.yml
```

Cloudflare Pages settings:

```text
Build command: npm run build
Output directory: dist
```

No Cloudflare-specific code is required.
