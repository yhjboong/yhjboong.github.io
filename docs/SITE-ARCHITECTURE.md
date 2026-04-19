# Site Architecture & Maintenance Guide

> Last updated: 2026-04-19

## Overview

Jekyll static site built on **AcademicPages** (fork of Minimal Mistakes).
Single-page academic portfolio hosted on GitHub Pages at `yhjboong.github.io`.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Generator | Jekyll |
| Theme base | AcademicPages / Minimal Mistakes |
| CSS | SCSS (Sass) with Susy grid (partially overridden by Flexbox) |
| Font | Inter (Google Fonts) |
| Icons | Font Awesome 6, Academicons |
| JS | jQuery (theme), vanilla JS (custom animations) |
| Hosting | GitHub Pages |

---

## Directory Structure (Key Files)

```
_config.yml                  # Site settings, author info, collections
_data/navigation.yml         # Navbar links (Research, Publications, News, CV)
_includes/
  head/custom.html           # ** Main customization file ** (CSS + JS overrides)
  masthead.html              # Navbar template
  author-profile.html        # Sidebar profile template
  footer.html                # Footer template (simplified)
  footer/custom.html         # Footer scripts (MathJax, Plotly, Mermaid)
_layouts/
  single.html                # Default page layout
_pages/
  about.md                   # Homepage content (/ route)
_sass/
  layout/
    _page.scss               # Main content area + #main flexbox container
    _sidebar.scss            # Sidebar sticky positioning
    _navigation.scss         # Navbar styles + theme toggle
    _masthead.scss           # Fixed navbar container
    _base.scss               # Global transitions, intro animation keyframes
    _footer.scss             # Footer styles
  theme/
    _air_light.scss           # Light theme CSS variables (:root)
    _air_dark.scss            # Dark theme CSS variables (html[data-theme="dark"])
assets/js/
  _main.js                   # Theme toggle, Plotly, smooth scroll, sticky footer
images/
  profile.jpeg               # Sidebar avatar
  pub/                       # Publication figures
  favicon.*                  # Favicons
tests/
  sidebar-overlap.spec.ts    # Playwright test for layout overlap
playwright.config.ts         # Playwright config (localhost:4000)
```

---

## Layout System

### Previous (Broken)
- Susy grid (`span(2 of 12)`, `span(10 of 12)`) + `position: fixed` sidebar
- Caused overlap at 1024-1100px viewports, impossible to center naturally

### Current (Flexbox)
All layout logic lives in `_page.scss` and `_sidebar.scss`:

```
#main (flex container)
  max-width: 1100px, margin: 0 auto
  padding: 3em horizontal
  gap: 3em
  |
  +-- .sidebar (flex-shrink: 0)
  |     width: 250px ($sidebar-link-max-width)
  |     position: sticky
  |     top: calc(masthead-height + 1.5em)
  |
  +-- .page (flex: 1, min-width: 0)
```

Susy `@include span()` rules are still present for sub-`$large` fallback, but overridden at `$large+` breakpoint by:
- `float: none; width: auto/250px; flex: 1;`

### Breakpoints
| Variable | Value | Purpose |
|----------|-------|---------|
| `$large` | 925px | Two-column layout activates |
| `$x-large` | 1280px | Max-width cap |
| `$masthead-height` | 70px | Sticky sidebar offset |
| `$sidebar-link-max-width` | 250px | Sidebar width |

---

## Customizations in `custom.html`

This file is the central place for all non-SCSS overrides. It contains:

### 1. Typography & Content Spacing
- `.page__content` line-height: 1.75
- h2: 1.4em, 600 weight, 2.5em top margin
- Lists: 0.6em item spacing
- `.page__title`: 1.8em, 700 weight

### 2. Sidebar Profile Refinements
- Avatar: 180px max, no border, subtle shadow
- Name: 1.15em, 600 weight
- Bio: `color: var(--global-link-color)` (hyperlink color in both light/dark)
- Icons: 1.35em, 0.7 opacity baseline
- Links: 0.9em font size

### 3. Motion & Micro-interactions
| Effect | Selector | Animation |
|--------|----------|-----------|
| Social link hover | `.author__urls li` | `translateY(-2px)`, icon opacity to 1 |
| Publication card hover | `.pub-card` (added via JS) | `translateY(-3px)`, box-shadow |
| News stagger reveal | `.reveal-item` (added via JS) | fade-in + slide-up, 0.08s stagger per item |
| Heading underline | `.animate-underline` (added via JS) | `scaleX(0->1)` left-to-right, cubic-bezier |

### 4. Theme Transition
- Background/color/border transitions on `html, body, .masthead, .greedy-nav, .masthead__menu-item, .page__footer, .author__urls`
- Duration: 0.4s ease
- Icon animation: rotate+scale out (0.25s) -> rotate+scale in with bounce (0.4s, cubic-bezier overshoot)

### 5. Accessibility
- `@media (prefers-reduced-motion: reduce)` disables all custom animations
- All transitions set to `none !important`
- Reveal items shown immediately (`opacity: 1, transform: none`)

### 6. Responsive
- `@media (max-width: 600px)`: publication flex cards stack vertically

---

## Theme (Light / Dark Mode)

### How it works
1. Page load: JS checks `localStorage("theme")` -> falls back to OS `prefers-color-scheme`
2. Sets `data-theme="dark"` on `<html>` (or removes it for light)
3. CSS variables in `:root` (light) and `html[data-theme="dark"]` (dark) take effect
4. Icon swaps between `fa-sun` / `fa-moon`

### Key files
- `_sass/theme/_air_light.scss` - Light mode variables (`:root`)
- `_sass/theme/_air_dark.scss` - Dark mode variables (`html[data-theme="dark"]`)
- `assets/js/_main.js` - `toggleTheme()`, `setTheme()`, `determineComputedTheme()`

### Toggle animation (in `_main.js`)
```
Click -> add .theme-icon-out (rotate 90deg + scale 0, 200ms)
      -> swap theme + icon class
      -> add .theme-icon-in (rotate -90deg->0 + scale 0->1, bounce easing, 400ms)
      -> remove .theme-icon-in
```

---

## JavaScript (custom.html)

### Smooth Scroll
Intercepts navbar anchor clicks (`#research-interests`, `#publications`, `#news`).
Only activates on homepage. Uses native `scrollIntoView({ behavior: 'smooth' })`.

### IntersectionObserver
Single observer instance handles:
- **h2 headings**: adds `.animate-underline` class, triggers `.is-visible` on scroll
- **News `<li>` items**: adds `.reveal-item` with staggered `transitionDelay`, triggers `.is-visible`
- **Publication cards**: adds `.pub-card` class (hover effect only, no scroll trigger)

Observer config: `{ threshold: 0.15, rootMargin: '0px 0px -30px 0px' }`

### JSON-LD
Structured data for SEO: WebSite schema with name variants.

---

## Navigation

Defined in `_data/navigation.yml`:
- Research -> `/#research-interests`
- Publications -> `/#publications`
- News -> `/#news`
- CV -> Google Drive link (external)

All internal links are same-page anchors using smooth scroll.

---

## Footer

Simplified to copyright + attribution only.
"FOLLOW" section and "Site last updated" line removed.
Template: `_includes/footer.html`

---

## Content Updates

### Adding a publication
In `_pages/about.md`, add a new `<div>` block under `## Publications`:
```html
<div style="display: flex; gap: 20px; align-items: flex-start; margin-bottom: 20px;">
  <img src="/images/pub/YEAR-VENUE-short-name.jpeg" alt="..." style="width: 180px; min-width: 180px; border: 1px solid #ddd; border-radius: 4px;" />
  <div>
    <strong>Paper Title</strong><br />
    Author list with <u>Yoo, H.</u> underlined<br />
    <em>Venue Year</em>, pp. X-Y.<br />
    <a href="URL">[PDF]</a>
  </div>
</div>
```
The JS will automatically add `.pub-card` for hover effect.

### Adding a news item
Add a new `- **[Date]**` line under `## News`.
The JS will automatically apply stagger reveal animation.

### Updating CV link
Edit `_data/navigation.yml`, change the `url` for the CV entry.

### Updating profile info
Edit `_config.yml` under `author:` section. Requires Jekyll restart.

---

## Testing

```bash
# Start local server
bundle exec jekyll serve -l -H localhost

# Run Playwright overlap tests
npx playwright test

# Test viewports: 925, 1024, 1100, 1280, 1440px
```

---

## Known Decisions

- **Susy grid kept but overridden**: Removing Susy entirely would require touching many files. The flexbox overrides (`float: none; width: auto;`) neutralize Susy at `$large+` without breaking sub-`$large` behavior.
- **Custom CSS in `<style>` tag, not SCSS**: Keeps all customizations in one file (`custom.html`) for easy maintenance, avoids touching theme SCSS files that may be updated upstream.
- **Bio color = link color**: `.author__bio` uses `var(--global-link-color)`, automatically adapts to light/dark mode.
- **No profile image hover zoom**: Intentionally removed per preference.
