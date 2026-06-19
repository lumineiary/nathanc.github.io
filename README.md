# Photographer + Data Analyst Portfolio Website

Astro-powered static portfolio for photography and data analyst work.

The public site is fully static and deploys to GitHub Pages or Cloudflare Pages. Routine photography updates use the repo-local magic directory workflow:

```text
drop images into inbox/galleries/[gallery-folder]/
add or edit gallery.md
run npm run build
commit the generated Markdown and WebP files
```

`npm run build` automatically imports magic-directory galleries before building the site. No separate import command is needed for normal updates.

## Commands

```bash
npm install
npm run dev
npm run validate
npm run build
npm run preview
```

Use `npm run dev` while designing and reviewing locally. Use `npm run build` before committing or deploying.

## Site Sections

Main routes:

```text
/
/photography
/photography/corporate-events
/photography/gallery/[slug]
/data
/data/project/[slug]
/contact
```

Photography and data work are intentionally separated so each audience can browse the proof that matters to them.

## Photography Categories

The photography page has these category tabs:

```text
All
Corporate & private events
Stage work
Photoshoot
Wedding & ROM
```

Each gallery chooses its category with the `photographyType` field in `gallery.md`.

Allowed `photographyType` values:

```text
corporate-private-events
stage-work
photoshoot
wedding-rom
```

The Photography page selects `Corporate & private events` by default. The `All` tab shows every published gallery in reverse date order.

## Magic Directory Gallery Workflow

Create one folder per gallery:

```text
inbox/galleries/my-event/
  gallery.md
  DSC001.jpg
  DSC002.jpg
  DSC003.webp
```

Supported source image formats:

```text
.jpg
.jpeg
.png
.webp
```

The smallest useful `gallery.md` is:

```md
---
title: My Event
photographyType: corporate-private-events
---

Optional write-up here.
```

Then run:

```bash
npm run build
```

The build runs the magic importer first. It will:

- process images from `inbox/galleries/[slug]/`
- create 480px long-edge thumbnail WebPs
- create 2800px long-edge large WebPs
- strip image metadata during processing
- write generated images to `public/images/galleries/[slug]/`
- write `manifest.json` for fast repeat imports
- create or update `src/content/photography/[slug].md`
- build the final static site into `dist/`

Generated Markdown stays intentionally simple. It does not need an explicit `images:` list; the site reads gallery images from:

```text
public/images/galleries/[slug]/manifest.json
```

If `gallery.md` is missing, the importer creates a starter file using the folder name.

Raw inbox images are ignored by Git:

```text
inbox/
```

Commit the generated Markdown files, generated WebP files, and `manifest.json` files. That keeps the published site portable without committing original camera JPEGs.

## gallery.md Fields

Recommended fields:

```yaml
title: My Event
photographyType: corporate-private-events
date: 2026-06-19
category: Corporate Event
client: Client Name
clientVisibility: public
featured: false
publishStatus: published
summary: Short card summary.
description: Longer gallery description.
services:
  - Event photography
  - Speaker coverage
tags:
  - corporate
  - event
coverImage: /images/galleries/my-event/image-001-large.webp
```

Required in practice:

```yaml
title: My Event
```

Strongly recommended:

```yaml
photographyType: corporate-private-events
publishStatus: published
```

If optional metadata is missing, the site should still display the gallery where possible.

### Field Notes

`title`
: Human-readable gallery title.

`photographyType`
: Controls which Photography tab the gallery appears under.

`date`
: Used for sorting. Format should be `YYYY-MM-DD`.

`category`
: Small card label, such as `Corporate Event`, `Stage Work`, `Photoshoot`, or `Wedding & ROM`.

`client`
: Optional client name.

`clientVisibility`
: Controls client-name display. Allowed values are `public`, `confidential`, and `hidden`.

`featured`
: Marks the gallery as eligible for featured placements.

`publishStatus`
: Use `published` for live galleries. Other supported values are `draft` and `archived`.

`summary`
: Short text for cards and previews.

`description`
: Longer description for the gallery page.

`services`
: Optional list of services provided.

`tags`
: Optional list of tags.

`coverImage`
: Optional explicit cover image. If omitted, the site uses the first processed gallery image where possible.

## Data Projects

Data projects live in:

```text
src/content/data-projects/[slug].mdx
```

Typical frontmatter:

```yaml
title: Project Title
date: 2026-06-19
featured: true
publishStatus: published
summary: Short project summary.
tools:
  - Python
  - SQL
tags:
  - analytics
githubUrl: https://github.com/example/project
demoUrl: https://example.com
coverImage: /images/data/project-cover.webp
```

The MDX body is used for the project write-up.

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
