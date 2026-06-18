# Product Design Document: Photographer + Data Analyst Portfolio Website

## 1. Product Summary

Build a clean, high-performance dual-purpose portfolio website for a Singapore-based photographer and data analyst. The website should act as both a photography showcase and a data analyst showcase, presenting corporate/event photography, selected social/content work, and data/technology projects in one coherent personal platform.

The photography side of the website should be as clean and minimal as possible, with an off-white background as the default visual direction. This restraint is especially important for photography because the images should carry the page. These photography-specific aesthetic rules do not need to apply rigidly to the data side of the website, which may use a more analytical, dashboard-like, or technical presentation where appropriate.

The system must support a simple local GUI workflow for adding new galleries and projects, importing selected images from Google Photos, generating optimized responsive WebP images, and publishing to GitHub Pages and Cloudflare Pages without ecosystem lock-in.

The finished product should feel like a premium photographer portfolio and a credible data analyst portfolio, not a generic web template.

## 2. Core Product Principle

The website has a dual purpose:

1. Showcase photography work to corporate clients, agencies, and collaborators.
2. Showcase data analytics and technical ability to recruiters, employers, and collaborators.

The homepage should act as a refined gateway into these two tracks. Photography and data should each have their own dedicated section/page hierarchy so visitors can explore the relevant body of work separately.

Photography presentation is the primary visual-design driver because it is the most aesthetics-sensitive part of the site.

The site should be:

- Clean
- Fast
- Editorial
- Minimal
- Premium
- Image-led
- Consistent in typography
- Easy to update
- Portable across static hosting providers

The user should not manually design a new page for every new event. New events and projects should be added through structured content files and rendered automatically using reusable templates.

## 3. Target User

Primary user:

- Freelance corporate/event photographer
- Social media content creator
- Data analytics student and aspiring tech professional
- Uses Google Photos heavily for client delivery
- Wants strong GitHub integration
- Wants zero or near-zero recurring platform cost
- Wants to avoid portfolio-builder lock-in

Secondary users:

- Corporate clients
- Event agencies
- PR agencies
- Production companies
- AV/livestreaming vendors
- Recruiters
- Data/tech employers
- Collaborators

## 4. Primary Goals

The system must:

1. Present photography work beautifully.
2. Use a justified gallery layout, not masonry.
3. Preserve image aspect ratios in gallery thumbnails.
4. Support small curated galleries and large galleries.
5. Provide a local GUI for adding galleries and projects.
6. Import selected images from Google Photos.
7. Generate optimized WebP image variants.
8. Store content in portable Markdown/MDX files.
9. Deploy natively to GitHub Pages.
10. Deploy natively to Cloudflare Pages.
11. Avoid proprietary CMS or website-builder lock-in.
12. Require little or no coding during routine updates.
13. Showcase both photography and data/tech work cleanly.
14. Keep photography and data content clearly separated through dedicated pages.
15. Use a consistent modern rounded sans-serif typographic system across the entire site.
16. Include a dedicated contact page and a lightweight homepage contact section.

## 5. Non-Goals

The initial product should not include:

- Payment processing
- E-commerce print sales
- Booking calendar
- Client login accounts
- Private proofing galleries
- Full CRM system
- Production server backend
- Fully automated Google Photos album syncing
- Editing RAW files
- Storing full-resolution client delivery files

The product is a portfolio and publishing system, not a full photography business operating system.

## 6. Recommended Architecture

```text
Google Photos
    ↓
Local Importer GUI
    ↓
Google Photos Picker API
    ↓
Local Image Processor
    ↓
Markdown/MDX Content Files + WebP Images
    ↓
Git Repository
    ↓
GitHub Actions / Cloudflare Pages Build
    ↓
Static Portfolio Website
```

Google Photos remains the full client-gallery platform. The portfolio stores curated public selections locally in the repository.

## 7. Hosting Requirements

### 7.1 GitHub Pages

The website must work on GitHub Pages.

Requirements:

- Static output only.
- Compatible with GitHub Actions deployment.
- Compatible with `username.github.io`.
- Compatible with a custom domain if added later.
- No production server runtime.
- No secret tokens exposed to frontend JavaScript.
- No backend-dependent page rendering.

### 7.2 Cloudflare Pages

The same repository must also work on Cloudflare Pages.

Requirements:

- Same source code.
- Same content files.
- Same image files.
- Same build command.
- Output directory should be `dist`.
- No Cloudflare-specific dependency required for core functionality.

Recommended Cloudflare Pages settings:

```text
Build command: npm run build
Output directory: dist
```

## 8. Technology Stack

Recommended implementation:

```text
Framework: Astro
Language: TypeScript
Content: Markdown/MDX with YAML frontmatter
Styling: CSS Modules, scoped Astro CSS, or Tailwind CSS
Image processing: Sharp
Gallery layout: Custom justified layout algorithm
Local GUI: Node.js local server
Google integration: Google Photos Picker API
Authentication: Google OAuth 2.0 with PKCE
Deployment: GitHub Actions and Cloudflare Pages
Package manager: npm or pnpm
```

Avoid:

- Proprietary website builders
- Proprietary CMS databases
- Runtime-only rendering
- Paid portfolio hosting dependencies
- Vendor-specific image CDN requirements

## 9. Technical Definitions

Static site:

A website generated into HTML, CSS, JavaScript, and image files before deployment. Visitors receive prebuilt files rather than pages generated by a server at request time.

Static-site generator:

A tool such as Astro that transforms components, templates, and content files into a deployable static website.

CMS:

Content management system. In this product, the CMS is represented by portable Markdown/MDX files and image files stored in Git.

Markdown:

A plain-text format for writing content. Markdown files can include structured metadata using YAML frontmatter.

MDX:

Markdown that can include reusable components. Use MDX only when a project page needs richer presentation.

YAML frontmatter:

Structured metadata at the top of a Markdown file, wrapped by `---`.

Slug:

A URL-safe identifier for a page, such as `ai-conference-singapore-2026`.

Justified gallery:

A gallery layout where images are grouped into rows with consistent row height. Each image's width changes according to its aspect ratio, preserving the natural shape of portrait, landscape, and square images.

Long edge resize:

Image resizing where the longest side is set to a fixed pixel length. For landscape images the width is the long edge. For portrait images the height is the long edge.

OAuth 2.0:

Google's authorization system that lets the local importer access selected Google Photos media without receiving the user's Google password.

PKCE:

A security extension for OAuth that protects local and browser-based authorization flows.

CI/CD:

Automated build and deployment process. GitHub Actions and Cloudflare Pages both provide CI/CD.

## 10. Information Architecture

Recommended routes:

```text
/
/photography
/photography/corporate-events
/photography/content
/photography/gallery/[slug]
/data
/data/project/[slug]
/about
/contact
```

## 11. Homepage Requirements

The homepage should include:

- Large visual hero with the main image staged first and the text hierarchy placed beneath it.
- One-line positioning statement.
- Corporate event work section showcasing one to two recent events.
- Data work section showcasing one featured data/tech project.
- Clear navigation to separate Photography and Data pages.
- Contact card or contact call-to-action.
- Minimal editorial layout.

Example positioning:

```text
Corporate event photographer and data analytics student based in Singapore.
```

The homepage should avoid clutter, loud effects, and generic startup-style design.

The homepage must not collapse photography and data into one long blended page. It should provide a high-quality preview of each side, then route visitors into dedicated pages.

The homepage hero should loosely follow the hierarchy of premium product pages such as Apple's MacBook Pro presentation: clear headline hierarchy, strong restraint, and a premium sense of spacing. It should not copy Apple's black-background look; the portfolio should remain warm, off-white, minimal, and photography-appropriate.

The homepage hero should not over-emphasize a single recent photograph or event. It should be text-led and should represent the dual identity of the site. If visual proof is shown in the hero, use a balanced preview system that gives appropriate weight to photography, data work, and the broader portfolio identity rather than making one event image dominate the page.

The homepage hero should not contain the primary "Explore photography" and "Explore data work" buttons. Those calls to action should appear inside their relevant Corporate Event Work and Data Work sections, where the visitor has already seen context for each area.

Required homepage order:

```text
Hero
Corporate event work
Data work
Contact card
```

Homepage section hierarchy requirements:

```text
Section label
Section headline
Supporting paragraph
Section CTA
Content cards
```

Do not place the section label, headline, paragraph, and CTA into competing horizontal columns. The section intro should read as one clear block before the cards. Section headlines must be visibly subordinate to the homepage `h1`; `h2` should not visually overpower the page hero.

Alignment system:

```text
Desktop page hero/introduction blocks: center-aligned within a controlled max-width container
Desktop homepage section introduction blocks: center-aligned within a controlled max-width container
Mobile page and section introduction blocks: center-aligned within the viewport
Contact intro blocks: center-aligned within a controlled max-width container
Cards, gallery metadata, project details, and content bodies: left-aligned
```

Do not mix centered text with left-positioned flex/grid children inside the same intro block. Text alignment should be intentional at the component level, not inherited accidentally from responsive grid behavior. Cards and detailed content may remain left-aligned for readability.

## 12. Photography Section Requirements

### 12.1 Photography Landing Page

Route:

```text
/photography
```

Should include:

- Featured galleries.
- Category filters.
- Short positioning copy.
- Clear contact CTA.
- Link to corporate events.
- Link to content/social work if included.

### 12.2 Corporate Events Listing Page

Route:

```text
/photography/corporate-events
```

This page must be automatically generated from photography Markdown files where:

```yaml
section: "corporate-events"
publishStatus: "published"
```

The user should not manually design this page for every new event.

### 12.3 Gallery Detail Page

Route:

```text
/photography/gallery/[slug]
```

Each gallery detail page should include:

- Title
- Date
- Event category
- Venue
- Client name if public
- Short description
- Services delivered
- Cover image
- Justified gallery
- Optional testimonial
- Optional Google Photos full-gallery link
- Related galleries
- Contact CTA

## 13. Data/Tech Section Requirements

### 13.1 Data Landing Page

Route:

```text
/data
```

Should include:

- Featured data/tech projects.
- Tools and skills.
- Short professional positioning.
- Link to GitHub profile.
- Contact CTA.

### 13.2 Data Project Detail Page

Route:

```text
/data/project/[slug]
```

Each project should include:

- Project title
- Problem statement
- Tools used
- Dataset description
- Methodology
- Screenshots or charts
- Results
- GitHub repository link
- Live demo link if available
- Lessons learned

## 13.3 Contact Page Requirements

Route:

```text
/contact
```

The contact page should include:

- Clear heading.
- Short context for photography, content, analytics, and collaboration enquiries.
- WhatsApp link.
- Gmail link.

Required contact links:

```text
WhatsApp: https://wa.me/6589271158
Gmail: mailto:ashchong138@gmail.com
```

The homepage should also include a lightweight contact section linking to the same WhatsApp and Gmail details.

## 14. Content Model

### 14.1 Photography Content File

Each photography gallery should be one Markdown or MDX file:

```text
src/content/photography/ai-conference-singapore-2026.md
```

Example:

```md
---
title: "AI Conference Singapore 2026"
slug: "ai-conference-singapore-2026"
date: "2026-08-15"
category: "Corporate Event"
section: "corporate-events"
venue: "Marina Bay Sands"
client: "Confidential"
clientVisibility: "confidential"
featured: true
publishStatus: "published"
coverImage: "/images/galleries/ai-conference-singapore-2026/image-001-large.webp"
googlePhotosUrl: "https://photos.app.goo.gl/example"
services:
  - Event photography
  - Speaker coverage
  - Networking coverage
tags:
  - corporate
  - conference
  - technology
images:
  - thumb: "/images/galleries/ai-conference-singapore-2026/image-001-thumb.webp"
    large: "/images/galleries/ai-conference-singapore-2026/image-001-large.webp"
    width: 2800
    height: 1867
    aspectRatio: 1.5
    alt: "Speaker presenting to a corporate conference audience"
  - thumb: "/images/galleries/ai-conference-singapore-2026/image-002-thumb.webp"
    large: "/images/galleries/ai-conference-singapore-2026/image-002-large.webp"
    width: 1867
    height: 2800
    aspectRatio: 0.667
    alt: "Attendees networking during a corporate event"
---

Short write-up about the event, the brief, and the type of coverage delivered.
```

The Markdown body renders as the gallery's narrative description.

### 14.2 Data Project Content File

Each data/tech project should be one Markdown or MDX file:

```text
src/content/data-projects/photo-business-dashboard.md
```

Example:

```md
---
title: "Photography Revenue Dashboard"
slug: "photo-business-dashboard"
date: "2026-07-01"
featured: true
publishStatus: "published"
tools:
  - Python
  - Pandas
  - Excel
  - Power BI
githubUrl: "https://github.com/username/photo-business-dashboard"
demoUrl: ""
coverImage: "/images/data/photo-business-dashboard/cover.webp"
summary: "A dashboard for tracking photography leads, client segments, monthly revenue and repeat bookings."
tags:
  - analytics
  - business intelligence
  - freelance operations
---

## Problem

I needed a clearer way to understand which photography clients and event types generated the highest effective hourly income.

## Method

I cleaned monthly gig data, categorized clients, calculated effective hourly rates, and built a dashboard showing revenue by segment.

## Result

The dashboard helped identify that corporate events and recurring production partners produced the strongest income per hour.
```

## 15. Template-Driven Rendering

The site must use reusable templates.

New events and projects should work like this:

```text
Add Markdown file + images
    ↓
Run dev/build
    ↓
Site automatically renders listing and detail pages
```

The user should not design individual pages for each event.

Recommended templates/components:

```text
src/layouts/BaseLayout.astro
src/layouts/GalleryLayout.astro
src/layouts/ProjectLayout.astro
src/pages/photography/gallery/[slug].astro
src/pages/photography/corporate-events.astro
src/pages/data/project/[slug].astro
src/components/JustifiedGallery.astro
src/components/Lightbox.tsx
src/components/GalleryCard.astro
src/components/ProjectCard.astro
```

## 16. Gallery Layout Requirements

Use justified layout only.

The gallery must:

- Preserve each image's aspect ratio.
- Arrange images into visually balanced rows.
- Resize thumbnail windows to suit image dimensions.
- Support portrait, landscape, and square images.
- Avoid rigid equal-size cards.
- Avoid masonry layout.
- Feel similar in polish to Google Photos-style image grids.

Justified layout algorithm requirements:

1. Read each image's `width`, `height`, and `aspectRatio`.
2. Use a target row height based on viewport width.
3. Add images to a row until the row's total aspect ratio fills the available container width.
4. Compute final row height.
5. Render each image at `rowHeight * aspectRatio` width.
6. Account for gaps between images.
7. Avoid extreme row heights.
8. Handle the final row gracefully.

Suggested target row heights:

```text
Mobile: 140-180px
Tablet: 180-240px
Desktop: 240-340px
Large desktop: 300-380px
```

## 17. Gallery Performance Requirements

The system must support:

```text
Typical gallery: 15-30 images
Large gallery: 100-300 images
Stress target: 500 images
```

Required techniques:

- Native lazy loading.
- Responsive layout calculation.
- Width and height metadata to prevent layout shift.
- Load thumbnails in the grid.
- Load 2800px large images only in lightbox or explicit large-view context.
- Preload only critical above-the-fold images.
- Avoid loading all large images on initial page load.

For galleries above 80 images, implement at least one:

- Progressive "Load More" batches.
- Viewport-based incremental rendering.
- Section grouping by event segment.

The default implementation should support "Load More" because it is simple, static-site-friendly, and robust.

## 18. Image Processing Requirements

For each imported image, generate exactly two WebP outputs:

```text
Thumbnail: 480px long edge, WebP
Large display: 2800px long edge, WebP
```

Long edge behavior:

```text
Landscape image: width becomes 2800px for large display
Portrait image: height becomes 2800px for large display
Square image: width and height become 2800px for large display
```

For thumbnails:

```text
Landscape image: width becomes 480px
Portrait image: height becomes 480px
Square image: width and height become 480px
```

Processing steps:

1. Correct image orientation.
2. Convert to sRGB.
3. Strip GPS metadata.
4. Strip unnecessary EXIF metadata.
5. Generate 480px-long-edge WebP thumbnail.
6. Generate 2800px-long-edge WebP large display image.
7. Record large image width.
8. Record large image height.
9. Record aspect ratio.
10. Write image paths into the gallery Markdown file.

Recommended WebP quality:

```text
Thumbnail: 76-82
Large display: 82-88
```

No small, standard, JPEG, AVIF, or full-resolution variants are required in the initial version.

## 19. Image Storage Requirements

Recommended output structure:

```text
public/images/galleries/[gallery-slug]/
  image-001-thumb.webp
  image-001-large.webp
  image-002-thumb.webp
  image-002-large.webp
```

Data project image structure:

```text
public/images/data/[project-slug]/
  cover.webp
  screenshot-001.webp
```

Do not store:

- RAW files
- Original full-resolution client files
- Duplicate JPEG exports unless explicitly needed later
- Google OAuth tokens
- `.env` files

## 20. Local GUI Importer Requirements

The system must include a local importer.

Command:

```bash
npm run import
```

The importer should open:

```text
http://127.0.0.1:4174
```

The local importer should:

1. Start a local-only server.
2. Authenticate with Google using OAuth 2.0 and PKCE.
3. Open the Google Photos Picker.
4. Let the user select portfolio images.
5. Download selected images while authorized URLs are valid.
6. Process images into WebP variants.
7. Show a GUI form for event metadata.
8. Allow image reordering.
9. Allow cover image selection.
10. Require alt text before publishing.
11. Allow draft/published status.
12. Preview the generated gallery.
13. Save the Markdown file and image files.
14. Optionally commit and push changes.

The importer runs locally only. It is not part of the deployed public website.

## 21. Importer Form Fields

Photography gallery fields:

```yaml
title:
slug:
date:
category:
section:
venue:
client:
clientVisibility:
description:
services:
tags:
coverImage:
googlePhotosUrl:
featured:
publishStatus:
testimonial:
images:
```

Allowed `clientVisibility` values:

```text
public
confidential
hidden
```

Allowed `publishStatus` values:

```text
draft
published
archived
```

Allowed `section` values in initial version:

```text
corporate-events
content
portraits
personal
```

## 22. Google Photos Integration Requirements

Use the official Google Photos Picker API.

The system should not attempt to hotlink Google Photos image URLs on the public website because selected media URLs are not designed to be permanent public portfolio assets.

Correct workflow:

```text
Select from Google Photos
    ↓
Download selected media locally
    ↓
Generate local WebP assets
    ↓
Commit assets to repository
    ↓
Deploy static site
```

The Google Photos full album URL may be stored as a link for visitors who need to view the complete client gallery, subject to client permission.

## 23. Security Requirements

The system must:

- Store Google OAuth tokens locally only.
- Never commit OAuth tokens.
- Never expose tokens in frontend JavaScript.
- Never commit `.env` files.
- Never commit `.portfolio-auth`.
- Bind the importer to `127.0.0.1`.
- Use OAuth `state` protection.
- Use PKCE.
- Strip GPS metadata from public images.
- Support hiding client names.
- Support draft galleries excluded from production listings.

Required `.gitignore` entries:

```text
.env
.env.*
.portfolio-auth/
.google-auth/
node_modules/
dist/
```

## 24. Privacy Requirements

Before publishing, the importer should warn if:

- GPS metadata was detected.
- Client name is set to public.
- A Google Photos link is included.
- Gallery contains more than 80 images.
- Publish status is set to `published`.
- Alt text is missing.

The system should block publishing if required fields or alt text are missing.

## 25. Design Requirements

Visual direction:

- Minimal
- Editorial
- Calm
- Premium
- Typography-led where appropriate
- Image-first
- High whitespace discipline
- Clean navigation
- Consistent modern rounded sans-serif typography

Avoid:

- Loud gradients
- Generic portfolio templates
- Excessive icons
- Heavy glassmorphism
- Over-animation
- Cluttered card grids
- Distracting hover effects
- Mixing serif and sans-serif display styles without a strong reason

Suggested design palette:

```text
Photography background: off-white or warm white by default
Data background: may use off-white, warm white, charcoal, or restrained technical surfaces
Text: near-black or off-white depending on theme
Accent: one restrained muted colour
Typography: consistent modern rounded sans-serif with generous spacing
```

The typography should feel closer to modern Apple, Google, or OpenAI product design than to an editorial serif magazine. Serif fonts should not be used in the default visual system.

Heading typography requirements:

```text
h1: 72px font size, -1px letter spacing
h2: -1px letter spacing
h3: -2px letter spacing
```

Body text should prioritize readability and should use an 18px base font size in the default desktop design. Supporting text, buttons, metadata, and contact details should be scaled accordingly so they do not feel visually tiny on modern displays.

The implementation may use light mode only initially, but the design should be structured so dark mode can be added later.

## 26. Responsive Design Requirements

The site must work well on:

- Mobile phones
- Tablets
- Laptops
- Large desktop monitors

Gallery behavior:

```text
Mobile: compact justified rows
Tablet: medium justified rows
Desktop: full justified layout
Large desktop: constrained max-width, not endlessly stretched
```

The gallery container should use a maximum width so images do not become visually awkward on very wide displays.

## 27. Accessibility Requirements

The site must include:

- Semantic HTML.
- Keyboard-navigable navigation.
- Keyboard-navigable lightbox.
- Alt text for all public images.
- Visible focus states.
- Sufficient color contrast.
- Reduced-motion support.
- No critical text embedded only in images.

The importer should require alt text before a gallery can be published.

## 28. SEO Requirements

Each gallery and project should generate:

- Page title.
- Meta description.
- Open Graph image.
- Canonical URL.
- Clean slug.
- Sitemap entry.

The site should include:

```text
sitemap.xml
robots.txt
Open Graph metadata
```

Photography pages should be indexable unless marked as draft or archived.

## 29. Deployment Requirements

Required package scripts:

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "validate": "astro check",
    "import": "node importer/server.mjs"
  }
}
```

GitHub Pages should deploy through GitHub Actions.

Cloudflare Pages should deploy from the same repository with:

```text
npm run build
dist
```

No code changes should be required when switching deployment provider.

## 30. Portability Requirements

The project must remain portable.

Therefore:

- Content must be Markdown, MDX, YAML, or JSON.
- Images must be regular files.
- Build output must be static.
- No proprietary database.
- No proprietary CMS.
- No platform-specific image CDN dependency.
- No required paid service.
- No dependency on Google Photos URLs for public image rendering.

## 31. Repository Structure

Recommended structure:

```text
portfolio-site/
  .github/
    workflows/
      deploy.yml
  importer/
    server.mjs
    google-auth.mjs
    google-picker.mjs
    image-pipeline.mjs
    event-writer.mjs
  public/
    favicon.svg
    images/
      galleries/
      data/
  src/
    components/
      JustifiedGallery.astro
      Lightbox.tsx
      GalleryCard.astro
      ProjectCard.astro
    content/
      photography/
      data-projects/
    layouts/
      BaseLayout.astro
      GalleryLayout.astro
      ProjectLayout.astro
    pages/
      index.astro
      about.astro
      contact.astro
      photography/
        index.astro
        corporate-events.astro
        content.astro
        gallery/
          [slug].astro
      data/
        index.astro
        project/
          [slug].astro
    styles/
      global.css
  astro.config.mjs
  package.json
  README.md
```

## 32. Validation Requirements

The system should validate:

- Required frontmatter fields.
- Valid date format.
- Unique slugs.
- Valid publish status.
- Existing image paths.
- Image width and height.
- Positive aspect ratios.
- Alt text for published galleries.
- No draft galleries in production listings.

Validation should fail the build when published content is invalid.

## 33. Build Agent Implementation Order

The agent should build in this order:

1. Scaffold Astro project.
2. Configure TypeScript and content collections.
3. Create base visual design system.
4. Build homepage.
5. Build photography listing pages.
6. Build gallery detail template.
7. Implement justified gallery.
8. Add lightbox using large WebP images.
9. Add image lazy loading and load-more behavior.
10. Add sample photography content.
11. Build data/tech project pages.
12. Add sample data project content.
13. Build local importer GUI.
14. Integrate Google OAuth with PKCE.
15. Integrate Google Photos Picker API.
16. Implement image processing pipeline.
17. Generate Markdown files from importer.
18. Add preview and save workflow.
19. Add optional commit/push workflow.
20. Add GitHub Pages deployment.
21. Confirm Cloudflare Pages compatibility.
22. Add validation scripts.
23. Add README documentation.

## 34. Acceptance Criteria

The project is complete when:

- The site builds successfully.
- The site deploys to GitHub Pages.
- The same repository deploys to Cloudflare Pages.
- New photography galleries can be added through Markdown files.
- New photography galleries can be added through the local GUI importer.
- The importer can select images from Google Photos.
- Imported images are saved as 480px and 2800px long-edge WebP files.
- The gallery uses justified layout only.
- Gallery thumbnails preserve image aspect ratios.
- Large images load only when needed.
- Galleries with 100+ images remain usable.
- Published galleries require alt text.
- Draft galleries are excluded from production listings.
- Data projects render from Markdown/MDX files.
- No secrets are committed.
- The design feels premium, clean, and photographer-appropriate.
- The user does not need to manually design pages for new events.

## 35. Final Product Description

The final product is a portable, GitHub-native, static portfolio system for a photographer with technical ambitions. It should combine excellent visual presentation, simple content publishing, Google Photos-assisted importing, and strong deployment portability.

The product should make routine updates feel like:

```text
Run importer
Select images
Fill event details
Preview
Publish
```

not:

```text
Design a new webpage
Manually resize files
Hand-place images
Rebuild layouts
Fight a CMS
```

The website itself should become proof of both creative taste and technical competence.
