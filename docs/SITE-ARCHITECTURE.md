# Site Architecture & Maintenance Guide

> Last updated: 2026-08-23

## Overview

This is a Jekyll static academic portfolio based on AcademicPages / Minimal
Mistakes and hosted with GitHub Pages. The homepage is a compact research
editorial: one concise hero, three research-interest cards, two selected
publication cards, and a four-entry news timeline.

The homepage content is intentionally limited to completed and public work.
Do not add papers or projects that are merely planned, in preparation, or under
review.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Generator | Jekyll |
| Theme base | AcademicPages / Minimal Mistakes |
| CSS | SCSS theme plus homepage overrides in `_includes/head/custom.html` |
| JavaScript | jQuery, vanilla JavaScript, and the bundled `assets/js/main.min.js` |
| Browser checks | Playwright |
| Hosting | GitHub Pages |

## Key Files

```text
_config.yml                    Site settings and author profile
_config.local.yml              Local-origin override for previews and browser checks
_data/navigation.yml           Main navigation links
_includes/
  head/custom.html             Homepage component CSS and small page scripts
  masthead.html                Navigation and theme controls
  author-profile.html          Sidebar profile and Contact disclosure
_pages/about.md                Homepage content and semantic component markup
_sass/layout/                  Theme layout, sidebar, and navigation foundations
_sass/theme/                   Light and dark theme variables
assets/js/
  _main.js                     Theme, disclosures, motion preference, sticky footer
  main.min.js                  Generated browser bundle
files/Dan_Yoo_CV.pdf           Locally hosted public CV used by all CV links
images/pub/                    Local publication figures
tests/
  homepage-ui.spec.ts          Homepage, responsive, theme, and accessibility contract
  sidebar-overlap.spec.ts      Desktop sidebar/content overlap regression
playwright.config.ts           Playwright configuration (`localhost:4000`)
```

## Layout

The page shell is a centered flex container at the `$large` breakpoint:

```text
#main
├── .sidebar    fixed-width, sticky profile at 925px and wider
└── .page       flexible content column with min-width: 0
```

| Width | Expected behavior |
| --- | --- |
| Below 925px | Single-column page and Contact disclosure button |
| 925px and wider | Sticky 250px sidebar plus flexible page content |
| 1100px and wider | Publication figure and copy appear side by side |
| 700px and narrower | News date/content stack; compact horizontal padding |
| 380px and narrower | Hero actions become a full-width vertical stack |

The research grid uses `repeat(auto-fit, minmax(190px, 1fr))`; it forms three
columns when space permits and naturally collapses without hard-coded device
widths. Every component must keep `min-width: 0` where long paper titles or URLs
could otherwise create horizontal overflow.

## Homepage Component Contract

The selectors below are both styling hooks and the browser-test contract. Keep
them stable when editing copy or adding content.

### Hero

```html
<header class="home-hero" aria-labelledby="home-hero-title">
  <h1 id="home-hero-title">...</h1>
  <nav class="home-hero__actions" aria-label="Profile actions">...</nav>
</header>
```

- The page has exactly one `<h1>`.
- `.home-hero__actions` contains named links for Publications, CV, and email.
- Use a link for navigation or a download; do not style a scripted action as a link.
- Keep the summary compact so the selected work remains near the first viewport.

### Research Interests

```text
#research-interests.home-section
└── .research-grid
    └── article.research-card × 3
```

Each card has one `<h3>` and a one- or two-sentence explanation. Maintain exactly
three cards unless the visual and Playwright contracts are deliberately revised
together.

### Publications

```text
#publications.home-section
└── .publication-grid
    └── article.publication-card
        ├── figure.publication-card__figure
        │   ├── image/frame
        │   └── source/licence attribution
        └── .publication-card__body
            ├── .publication-card__venue
            ├── h3
            ├── summary and authors
            └── .publication-card__links
```

The current homepage intentionally contains two selected publications. Each card
must have one locally hosted main figure under `images/pub/`. Use the figure that
best communicates the paper's main contribution, not a screenshot of the paper's
first page.

For every figure:

- Set intrinsic `width` and `height` so the browser reserves space before load.
- Keep the source local (`/images/...`) and use a web-sized format.
- Write alt text that conveys the figure's essential meaning; generic text such as
  “paper figure” is not sufficient.
- Keep visible figure/source and licence attribution when required.
- Use `loading="lazy"` and `decoding="async"` for below-the-fold figures.
- Preserve the card's figure/body class names when changing markup.

Use `.publication-card__links` for clear, separately named `Paper` and `DOI`
links. Verify every DOI against the publisher page before changing it.

### News Timeline

```text
#news.home-section
└── ol.news-timeline
    └── li.news-timeline__item
        ├── time[datetime="YYYY-MM"]
        └── .news-timeline__content
```

Keep reverse chronological order. Dates must remain visible text and use a
machine-readable `datetime="YYYY-MM"`. The line and dots are decorative CSS, not
content. The current test contract expects four entries.

## Interactive and Accessibility Behavior

### Contact disclosure

The responsive Contact control is a native button with
`data-contact-toggle`, `aria-controls="author-contact-links"`, and a truthful
`aria-expanded` value. On narrow screens, Enter and Space open or close the
controlled list. On desktop, the list remains visible and the disclosure state
is reset. Escape closes an open disclosure from either the button or its menu
and returns focus to the Contact button.

### Priority navigation

The compact-navigation control is a native button with `data-nav-toggle`, an
accessible label, `aria-controls="site-nav-hidden-links"`, and synchronized
`aria-expanded`. Items moved by the greedy-navigation script remain ordinary
links. Enter and Space operate the button; Escape closes an open overflow menu
from the button or one of its links and returns focus to the toggle. The layout
is recalculated after web fonts finish loading so a cold load cannot leave a
stale hamburger.

### Theme control

The theme switch is a native button marked with `data-theme-toggle`.

1. `localStorage.theme` stores `light` or `dark` after an explicit choice.
2. With no explicit choice, the OS `prefers-color-scheme` value is used.
3. Dark mode sets `html[data-theme="dark"]`; light mode removes that attribute.
4. `aria-pressed="true"` means dark is active, and the accessible label describes
   the action that will occur next.
5. The `meta[name="theme-color"]` value changes with the computed theme.

Do not attach theme behavior to an anchor or icon. The icon is decorative and
must stay hidden from assistive technology.

### Keyboard focus and touch targets

Links, buttons, and explicit tabindex targets receive a high-contrast
`:focus-visible` outline. Do not remove it. Primary controls are at least 44px
tall; smaller inline paper links must still meet the 24×24 CSS-pixel WCAG 2.2
minimum or have sufficient spacing.

### Reduced motion

When `prefers-reduced-motion: reduce` is active:

- `html` uses `scroll-behavior: auto`.
- Cards and social links do not translate on hover.
- reveal content starts fully visible.
- heading and theme-icon animations are disabled.
- JavaScript skips smooth-scroll and fading branches.

Reduced motion is progressive enhancement, not a separate content state: all
research cards, publication cards, and news entries must remain present and
readable.

## Theme and Component Styling

Light/dark component tokens are declared in `_includes/head/custom.html`:

- `--card-surface` and `--card-surface-strong`
- `--card-border` and `--card-shadow`
- `--accent-soft`
- `--focus-ring`

Prefer these variables and the existing global theme variables over fixed colors.
The publication figure itself intentionally uses a white canvas because its
paper graphics were authored for a light background; its attribution color must
retain readable contrast on that canvas.

## Content Maintenance

### Add or replace a publication

1. Confirm the work is published and public.
2. Place an optimized main figure in `images/pub/`.
3. Add one `.publication-card` to `_pages/about.md` using the component contract.
4. Include venue, title, one-sentence contribution, complete author list, Paper
   and DOI links, intrinsic image dimensions, descriptive alt text, and source/
   licence attribution.
5. Update the expected card count in `tests/homepage-ui.spec.ts` only when the
   editorial decision to show more than two selected works is intentional.

### Update research interests

Edit only the heading and short copy within `.research-card`. Keep the three-card
information architecture unless the layout and tests are revised together.

### Add or replace news

Add a `.news-timeline__item` in reverse chronological order. Use `<time>` with a
valid `YYYY-MM` `datetime` value and concise visible month/year text. Keep only
high-signal milestones; when retaining four entries, replace the oldest item.

### Update profile, CV, or navigation

- Profile data: `_config.yml` under `author:` (restart Jekyll after changes).
- Public CV file: replace `files/Dan_Yoo_CV.pdf` with the current finished PDF.
- CV and main navigation destinations: `_data/navigation.yml`.
- Hero CTA destinations: `_pages/about.md`.

Keep duplicated CV destinations synchronized.

## JavaScript Maintenance

Edit `assets/js/_main.js`, not `assets/js/main.min.js` by hand. Rebuild the bundle
after source changes:

```bash
npm run build:js
```

The generated bundle is deployed by the static site, so source and bundle must be
reviewed together.

## Testing

Build and serve the Jekyll site in one terminal. The second config keeps CSS,
JavaScript, and internal navigation on the local origin so tests never mix a
local HTML build with production assets:

```bash
bundle exec jekyll serve -l -H localhost --config _config.yml,_config.local.yml
```

Then run the Chromium suite in another terminal:

```bash
npx playwright test
```

`tests/homepage-ui.spec.ts` verifies:

- one H1, three research cards, two publication cards, and four timeline dates;
- successfully loaded local publication images with meaningful alt text;
- the corrected EvalAgent DOI, CC BY captions, and locally served CV PDF;
- named hero CTAs and destination types;
- no horizontal overflow at 320, 375, 600, 768, 924, 925, 1024, 1280, and 1440px;
- wide and stacked card arrangements;
- Contact, navigation, and theme keyboard operation and ARIA state;
- persisted theme choice and synchronized browser theme color;
- deterministic light/dark body-text contrast signals; and
- visible content and disabled smooth motion under reduced-motion preference.

`tests/sidebar-overlap.spec.ts` separately protects the 925px desktop-layout
boundary and wider sidebar/content geometry.

For a syntax-only test discovery check that does not require a running server:

```bash
npx playwright test --list
```

## Architectural Decisions

- **Flexbox shell retained:** it avoids the prior Susy/fixed-sidebar overlap while
  leaving upstream theme code largely intact.
- **Homepage styles remain in the custom head include:** this isolates the visual
  layer from upstream SCSS updates; a later extraction should be a deliberate
  refactor with equivalent visual and browser-test coverage.
- **Semantic HTML precedes animation:** sections, articles, figures, ordered news,
  and native buttons work without JavaScript; scripts enhance theme and disclosure
  state.
- **Selected work stays compact:** publication filtering, carousels, parallax, and
  scroll-reveal dependencies are intentionally deferred to keep maintenance and
  motion complexity low.
