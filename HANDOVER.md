# Project Handover - Keith Tan Portfolio Site

Last updated: 2026-06-29

This document is intended to let another developer or AI model continue the project without needing the previous chat history. It covers the current project context, the UI decisions made during the recent work, exact files touched, current validation status, and suggested next steps.

## 1. Project Overview

This is an Astro static portfolio website for Keith Tan.

Project directory:

```text
/Users/macbook/Documents/test/portfolio-site
```

The public-facing site presents Keith as:

- Event photographer
- Social media/content creator
- Data analyst / dashboard builder

Main routes documented in the README:

```text
/
/photography
/photography/corporate-events
/photography/gallery/[slug]
/content
/data
/data/project/[slug]
/contact
```

The site is static and can deploy to GitHub Pages or Cloudflare Pages. Photography updates use the local magic-directory workflow described in `README.md`.

Important commands:

```bash
npm run dev
npm run check
npm run validate
npm run build
npm run preview
npm run social-copy
```

`npm run check` runs `npm run validate`, which runs:

```bash
ASTRO_TELEMETRY_DISABLED=1 astro check && node scripts/validate-content.mjs
```

## 2. Technology Stack

Key files:

- `package.json` - project scripts and dependencies.
- `astro.config.mjs` - Astro config.
- `src/pages/` - route files.
- `src/components/` - Astro components.
- `src/content/` - content collections for photography, content/social work, and data projects.
- `src/lib/site.ts` - site metadata and nav item config.
- `styles.css` - global styling for the entire site.

Dependencies of note:

- Astro 5
- MDX support
- `sharp` for image processing
- `justified-layout` for gallery layout
- `gray-matter` and `yaml` for content/import workflows

## 3. Current Git / Worktree State

At the time this handover was written, the worktree was already dirty. Modified files included more than just the recent UI changes:

```text
README.md
public/images/galleries/*/manifest.json
scripts/import-magic-directory.mjs
scripts/validate-content.mjs
src/components/ContentEmbedGrid.astro
src/components/HeroProof.astro
src/components/WorkCard.astro
src/content.config.ts
src/content/photography/*.md
src/lib/content.ts
src/pages/index.astro
src/pages/photography/gallery/[slug].astro
src/pages/photography/index.astro
styles.css
```

Important caution:

Do not assume every dirty file listed above was changed in the most recent navbar/background work. The latest UI work focused mainly on `styles.css`, with one small home hero markup change in `src/pages/index.astro`.

Before committing, inspect the full diff carefully:

```bash
git status --short
git diff
```

## 4. Recent Work Completed

The recent work focused on UI polish for the homepage and navbar:

1. Replaced per-section custom homepage background colours with a simple alternating background system.
2. Changed the tablet breakpoint from 900px/901px to 810px/811px to better suit iPad Air-sized layouts.
3. Improved the sticky navbar glass effect so it remains readable while scrolling over busy images/video.
4. Made the desktop/tablet navbar background span the full viewport width while keeping nav content aligned to the site grid.
5. Tuned navbar opacity values based on visual feedback.
6. Added backdrop blur back under the navbar surfaces to soften the colours peeking through, while preserving readability.
7. Adjusted the home hero title so "Keith." can break onto its own line on non-mobile layouts.

## 5. Homepage Background Band System

Original issue:

The homepage used individual CSS variables such as:

```css
--home-band-hero
--home-band-corporate
--home-band-social
--home-band-data
--home-band-contact
```

The user disliked the custom section-by-section colour choices and wanted a simpler alternating pattern.

Current approach:

- Removed the individual `--home-band-*` variables.
- Added one subtle alternate shade:

```css
--paper-subtle-deep: #f2ede4;
```

- Home bands now alternate between:

```css
var(--paper)
var(--paper-subtle-deep)
```

Key CSS:

```css
.home-hero::before,
.home-section::before,
.home-contact::before {
  content: "";
  position: absolute;
  inset-block: 0;
  left: 50%;
  z-index: -1;
  width: 100vw;
  transform: translateX(-50%);
  background: var(--paper);
}

.home-hero:nth-of-type(even)::before,
.home-section:nth-of-type(even)::before,
.home-contact:nth-of-type(even)::before {
  background: var(--paper-subtle-deep);
}
```

Each section uses a full-viewport pseudo-element behind constrained content. This avoids giving each content block its own custom colour.

Related CSS additions:

```css
html,
body {
  overflow-x: clip;
}
```

This helps prevent horizontal overflow from the `100vw` band pseudo-elements.

## 6. Responsive Breakpoints

Original breakpoint:

```css
@media (max-width: 900px)
@media (min-width: 901px)
```

Updated breakpoint:

```css
@media (max-width: 810px)
@media (min-width: 811px)
```

Reason:

The user wanted the tablet breakpoint tuned to suit iPad Air. The design now treats widths 811px and above as tablet/desktop-wide layout, while 810px and below use the narrower stacked layout.

Current relevant rules:

```css
@media (min-width: 811px) {
  .home-name-line {
    display: block;
  }
}

@media (min-width: 811px) and (max-width: 1259px) {
  .home-intro-grid {
    grid-template-columns: minmax(420px, 1fr) minmax(300px, 0.78fr);
    grid-template-areas:
      "name portrait"
      "identity portrait"
      "intro portrait";
    column-gap: clamp(36px, 5vw, 58px);
    row-gap: 24px;
    align-items: start;
  }
}

@media (max-width: 810px) {
  /* narrow/mobile layout rules */
}
```

## 7. Home Hero Markup and Layout

File:

```text
src/pages/index.astro
```

Current hero heading:

```astro
<h1 id="hero-title">Hi, I'm <span class="home-name-line">Keith.</span></h1>
```

Reason:

The `span.home-name-line` allows "Keith." to break onto its own line at widths above 811px, improving the home hero composition.

Related CSS:

```css
@media (min-width: 811px) {
  .home-name-line {
    display: block;
  }
}
```

Other hero layout changes in `styles.css`:

- `.home-intro-grid` now aligns items to `start`.
- `.home-intro-block` aligns to `start`.
- `.home-portrait-card` aligns to `start`.
- A specific intermediate layout exists from 811px to 1259px.

This was done to make the home hero read better across desktop/tablet widths.

## 8. Navbar / Liquid Glass Work

The navbar received several rounds of tuning. The final current state is below.

### 8.1 Desktop / Tablet Header

File:

```text
styles.css
```

Selector:

```css
.site-header
```

Current behavior:

- Sticky at the top.
- Full viewport width background.
- Content remains aligned to the site grid using responsive horizontal padding.
- Background is translucent, not fully opaque.
- Backdrop blur softens whatever page content is visible underneath.

Current CSS:

```css
.site-header {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  width: 100%;
  margin: 0 auto;
  padding: 22px max(var(--gutter), calc((100vw - var(--max)) / 2));
  background: rgba(247, 243, 235, 0.82);
  -webkit-backdrop-filter: blur(18px) saturate(1.08);
  backdrop-filter: blur(18px) saturate(1.08);
}
```

Important design decisions:

- `width: 100%` fixes the earlier issue where the navbar background stopped before the page edge.
- The padding expression keeps the content aligned to the same max-width grid as the page:

```css
padding: 22px max(var(--gutter), calc((100vw - var(--max)) / 2));
```

- Opacity is currently `0.82`.
- Blur is currently `18px`.
- Saturation is intentionally mild at `1.08`.
- Both standard and `-webkit-` prefixed backdrop filter are used for Safari/iOS support.

### 8.2 Mobile Header

Inside:

```css
@media (max-width: 620px)
```

Current CSS:

```css
.site-header {
  top: 10px;
  align-items: center;
  width: min(var(--max), calc(100% - 24px));
  border: 1px solid rgba(23, 22, 21, 0.08);
  border-radius: 999px;
  padding: 10px 12px 10px 18px;
  background: rgba(247, 243, 235, 0.82);
  box-shadow: 0 18px 50px rgba(66, 52, 34, 0.08);
  -webkit-backdrop-filter: blur(18px) saturate(1.08);
  backdrop-filter: blur(18px) saturate(1.08);
}
```

Important design decisions:

- Mobile header keeps the pill shape.
- Mobile header opacity is also `0.82`, per user request.
- Blur matches desktop/tablet.

### 8.3 Mobile Dropdown

Inside:

```css
@media (max-width: 620px)
```

Selector:

```css
.nav
```

Current CSS:

```css
.nav {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  left: 0;
  display: none;
  flex-direction: column;
  gap: 6px;
  border: 1px solid rgba(23, 22, 21, 0.08);
  border-radius: 26px;
  padding: 10px;
  background: rgba(247, 243, 235, 0.99);
  box-shadow: 0 28px 80px rgba(66, 52, 34, 0.14);
  -webkit-backdrop-filter: blur(18px) saturate(1.08);
  backdrop-filter: blur(18px) saturate(1.08);
  font-size: 1rem;
}
```

Important design decisions:

- Mobile dropdown opacity is `0.99`, per the final user request.
- This is intentionally much more opaque than the header because dropdown menu text needs maximum readability.
- Blur remains present, but because alpha is 0.99, the dropdown should read mostly as a solid paper panel.

## 9. Current Navbar Alpha Values

Final requested values:

```text
desktop/tablet header: 0.82
mobile header:         0.82
mobile dropdown:       0.99
```

Current matching CSS:

```css
background: rgba(247, 243, 235, 0.82); /* desktop/tablet header */
background: rgba(247, 243, 235, 0.82); /* mobile header */
background: rgba(247, 243, 235, 0.99); /* mobile dropdown */
```

Backdrop filter:

```css
-webkit-backdrop-filter: blur(18px) saturate(1.08);
backdrop-filter: blur(18px) saturate(1.08);
```

Do not change these values casually without checking screenshots against both busy imagery and plain paper backgrounds.

## 10. Other CSS Changes Visible in the Diff

The current `styles.css` diff also includes changes beyond the band and nav work. Some may have been from earlier work in the same project state:

- Curation badge styles:

```css
.curation-rank-badge
.curation-view-label
.curation-view .curation-rank-badge
.curation-view .curation-view-label
```

- Work card positioning:

```css
.work-card {
  position: relative;
}
```

- Social media card copy layout changed from CSS grid to flex:

```css
.home-social-copy {
  display: flex;
  min-height: 250px;
  flex-direction: column;
}
```

- Mobile social card spacing changes.
- Removal of `.gallery-meta` styles from this diff.

If another person/model is preparing a commit, review these changes in context before deciding whether to include them.

## 11. Validation Status

During the UI work, `npm run check` was run multiple times and passed.

The last completed validation before this handover had:

```text
0 errors
0 warnings
0 hints
Content validation passed.
```

Because the final requested alpha change was made immediately before handover work began, run one final check before committing:

```bash
npm run check
```

This handover file itself is Markdown and should not affect Astro validation.

## 12. Suggested Visual QA Checklist

Before shipping, open the site locally:

```bash
npm run dev
```

Then check these viewport widths:

```text
390px  - common mobile
620px  - mobile nav breakpoint boundary
810px  - narrow/tablet cutoff
811px  - tablet/desktop-wide cutoff
1024px - iPad/tablet landscape-ish
1280px - laptop/desktop
1440px - desktop
```

Specific things to inspect:

1. Navbar readability over busy images/videos.
2. Navbar background spans the full viewport on desktop/tablet.
3. Mobile pill header remains readable over busy content.
4. Mobile dropdown is readable and not too transparent.
5. No horizontal scrolling caused by the full-width background bands.
6. Homepage background bands alternate subtly, without section-specific custom colours.
7. Home hero layout at 811px to 1259px.
8. Home hero title line break: "Keith." should sit on its own line above 811px.
9. Social media cards still align properly after flex layout changes.
10. Photography gallery pages still look correct if `.gallery-meta` removal is intended.

## 13. Recommended Next Content Workflow

The current advice for progressing the site content:

1. Write the rough structure and core copy first.
2. Add actual media after the structure is clear.
3. Revise the copy once the real media is in place.

Do not over-polish copy before the photos/videos are added. A good target is:

```text
70% copy quality -> add real media -> rewrite around the actual proof
```

For this portfolio, the photos and videos should carry trust. The copy should provide context, framing, and client/business value without over-explaining.

## 14. Practical Next Steps

Suggested next steps for whoever continues:

1. Run:

```bash
cd /Users/macbook/Documents/test/portfolio-site
npm run check
```

2. Start local dev server:

```bash
npm run dev
```

3. Visually QA the navbar over:

- homepage hero image
- social media embed/video area
- photography gallery pages
- contact page

4. Inspect `git diff` and separate intentional changes from unrelated dirty work.

5. Decide whether `HANDOVER.md` should be committed or kept as a temporary project note.

6. Continue content work:

- home page copy
- photography gallery descriptions
- social media case study framing
- data project summaries
- contact CTA text

## 15. Key Files To Read First

For a new developer/model, read these in order:

```text
README.md
package.json
src/lib/site.ts
src/pages/index.astro
src/components/Nav.astro
styles.css
src/content.config.ts
scripts/validate-content.mjs
scripts/import-magic-directory.mjs
```

Then inspect the relevant page/component for whatever task is next.

## 16. Important Design Preferences From User Feedback

The user has expressed these preferences:

- Avoid ugly or arbitrary background colours.
- Do not give each homepage block its own custom colour.
- Prefer subtle alternating background shades.
- Tune tablet behavior around iPad Air; 810px/811px is the current breakpoint split.
- Navbar should emulate Apple's liquid glass somewhat, but must remain more readable and less transparent than Apple's version.
- Navbar transparency should allow some colour leakage, but the content underneath should be blurred enough not to distract.
- Mobile dropdown should be much more opaque than the header.
- Visual polish matters, but readability wins.

## 17. Known Risk Areas

Potential issues to watch:

- `backdrop-filter` support varies; Safari/iOS needs `-webkit-backdrop-filter`, which is already included for nav surfaces.
- Full-width pseudo-elements using `100vw` can cause horizontal overflow if `overflow-x: clip` is removed.
- The desktop/tablet header now uses `width: 100%`; if someone later adds borders/radius to desktop header, it may no longer feel like the intended full-width surface.
- The breakpoint change from 900px to 810px may affect layouts beyond the homepage because the `@media (max-width: 810px)` block contains many global responsive rules.
- The worktree has unrelated dirty files. Review before committing.

## 18. Final Current State Summary

The site currently has:

- A cleaner alternating homepage band system using `--paper` and `--paper-subtle-deep`.
- A tablet breakpoint tuned to 810px/811px.
- A readable liquid-glass-inspired navbar:
  - desktop/tablet header alpha `0.82`
  - mobile header alpha `0.82`
  - mobile dropdown alpha `0.99`
  - blur `18px`
  - saturate `1.08`
- Home hero heading markup that allows `Keith.` to line-break cleanly.
- Passing validation from previous runs, with a final `npm run check` recommended after this handover file addition.

