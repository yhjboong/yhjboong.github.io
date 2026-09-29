import { expect, Page, test } from '@playwright/test';

const overflowViewports = [320, 375, 600, 768, 924, 925, 1024, 1280, 1440];

async function openHome(page: Page) {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts?.ready);
}

function parseRgb(color: string): [number, number, number] {
  const channels = color.match(/[\d.]+/g)?.slice(0, 3).map(Number);
  if (!channels || channels.length !== 3) {
    throw new Error(`Expected an rgb/rgba color, received: ${color}`);
  }
  return channels as [number, number, number];
}

function contrastRatio(foreground: string, background: string) {
  const luminance = (color: string) => {
    const [r, g, b] = parseRgb(color).map((channel) => {
      const value = channel / 255;
      return value <= 0.04045
        ? value / 12.92
        : Math.pow((value + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const lighter = Math.max(luminance(foreground), luminance(background));
  const darker = Math.min(luminance(foreground), luminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

async function renderedColors(page: Page, selector: string) {
  return page.locator(selector).first().evaluate((element) => {
    const parse = (value: string) => {
      const values = value.match(/[\d.]+/g)?.map(Number) ?? [];
      return { r: values[0] ?? 0, g: values[1] ?? 0, b: values[2] ?? 0, a: values[3] ?? 1 };
    };

    let background = { r: 0, g: 0, b: 0, a: 0 };
    for (let node: Element | null = element; node && background.a < 1; node = node.parentElement) {
      const layer = parse(getComputedStyle(node).backgroundColor);
      const alpha = background.a + layer.a * (1 - background.a);
      if (alpha > 0) {
        background = {
          r: (background.r * background.a + layer.r * layer.a * (1 - background.a)) / alpha,
          g: (background.g * background.a + layer.g * layer.a * (1 - background.a)) / alpha,
          b: (background.b * background.a + layer.b * layer.a * (1 - background.a)) / alpha,
          a: alpha,
        };
      }
    }

    return {
      background: `rgb(${background.r}, ${background.g}, ${background.b})`,
      foreground: getComputedStyle(element).color,
    };
  });
}

test.describe('homepage content contract', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await openHome(page);
  });

  test('has one clear page heading and the expected content cards', async ({ page }) => {
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('.home-hero h1')).toHaveText(/Dan.*Yoo/i);
    await expect(page.locator('.home-hero__role')).toBeVisible();
    await expect(page.locator('.research-grid > .research-card')).toHaveCount(3);
    await expect(page.locator('.publication-grid > .publication-card')).toHaveCount(2);
    await expect(page.locator('.news-timeline time')).toHaveCount(4);

    const dates = await page.locator('.news-timeline time').evaluateAll((times) =>
      times.map((time) => ({
        machine: time.getAttribute('datetime'),
        visible: time.textContent?.trim(),
      })),
    );
    for (const date of dates) {
      expect(date.machine).toMatch(/^\d{4}-\d{2}$/);
      expect(date.visible).toBeTruthy();
    }
  });

  test('uses descriptive, successfully loaded local publication figures', async ({ page }) => {
    const figures = page.locator('.publication-card__figure img');
    await expect(figures).toHaveCount(2);

    for (let index = 0; index < 2; index += 1) {
      const figure = figures.nth(index);
      await figure.scrollIntoViewIfNeeded();
      await expect.poll(() => figure.evaluate((img) => img.complete && img.naturalWidth > 0)).toBe(true);

      const details = await figure.evaluate((img) => ({
        alt: img.getAttribute('alt')?.trim() ?? '',
        currentSrc: img.currentSrc,
        height: img.naturalHeight,
        width: img.naturalWidth,
      }));
      const source = new URL(details.currentSrc);

      expect(source.origin).toBe(new URL(page.url()).origin);
      expect(source.pathname).toMatch(/^\/images\//);
      expect(details.width).toBeGreaterThan(0);
      expect(details.height).toBeGreaterThan(0);
      expect(details.alt.length).toBeGreaterThan(12);
      expect(details.alt).not.toMatch(/^(image|figure|paper figure|publication figure)(\s+\d+)?$/i);
    }

    await expect(page.locator('.publication-card__attribution')).toHaveCount(0);
    await expect(page.getByText('Figure 1 from the paper')).toHaveCount(0);
    await expect(page.getByText('CC BY 4.0')).toHaveCount(0);
    const evalAgentCard = page.locator('.publication-card').filter({ hasText: 'EvalAgent:' });
    await expect(evalAgentCard.locator('a[href="https://doi.org/10.1145/3742414.3795096"]')).toHaveCount(1);
    await expect(page.locator('a[href*="3742414.3794774"]')).toHaveCount(0);
  });

  test('hero calls to action are named and lead somewhere meaningful', async ({ page }) => {
    const actions = page.locator('.home-hero__actions a');
    await expect(actions).toHaveCount(2);

    for (const action of await actions.all()) {
      await expect(action).toHaveAccessibleName(/\S+/);
      const href = await action.getAttribute('href');
      expect(href?.trim()).toBeTruthy();
      expect(href).not.toBe('#');
    }

    const publicationsCta = page.locator(
      '.home-hero__actions a[href="#publications"], .home-hero__actions a[href$="/#publications"]',
    );
    await expect(publicationsCta).toHaveCount(1);
    await expect(publicationsCta).toHaveAccessibleName(/publication/i);
    await expect(page.locator('.home-hero__actions a[href^="mailto:"]')).toHaveCount(1);
    await expect(page.getByRole('link', { name: /CV/i })).toHaveCount(0);
  });

  test('links to the stable Google Scholar profile URL', async ({ page }) => {
    const scholar = page.getByRole('link', { name: 'Google Scholar' });
    await expect(scholar).toHaveAttribute(
      'href',
      'https://scholar.google.com/citations?user=Q1y2o0cAAAAJ&hl=en',
    );
  });
});

for (const width of overflowViewports) {
  test(`has no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await openHome(page);

    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(
      dimensions.scrollWidth,
      `page is ${dimensions.scrollWidth - dimensions.clientWidth}px wider than the viewport`,
    ).toBeLessThanOrEqual(dimensions.clientWidth + 1);
  });
}

test.describe('responsive card layout', () => {
  test('research cards form a row on a wide screen and a column on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await openHome(page);

    const cards = page.locator('.research-grid > .research-card');
    const wideBoxes = await cards.evaluateAll((elements) =>
      elements.map((element) => {
        const card = element as HTMLElement;
        return { x: card.offsetLeft, y: card.offsetTop, height: card.offsetHeight };
      }),
    );
    expect(new Set(wideBoxes.map((box) => Math.round(box.x))).size).toBe(3);
    expect(Math.max(...wideBoxes.map((box) => box.y)) - Math.min(...wideBoxes.map((box) => box.y))).toBeLessThan(5);

    await page.setViewportSize({ width: 375, height: 900 });
    await openHome(page);
    const narrowBoxes = await cards.evaluateAll((elements) =>
      elements.map((element) => {
        const card = element as HTMLElement;
        return { x: card.offsetLeft, y: card.offsetTop, height: card.offsetHeight };
      }),
    );
    expect(Math.max(...narrowBoxes.map((box) => box.x)) - Math.min(...narrowBoxes.map((box) => box.x))).toBeLessThan(3);
    expect(narrowBoxes[1].y).toBeGreaterThan(narrowBoxes[0].y + narrowBoxes[0].height - 1);
    expect(narrowBoxes[2].y).toBeGreaterThan(narrowBoxes[1].y + narrowBoxes[1].height - 1);
  });

  test('publication cards use one row each with responsive figure placement', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await openHome(page);

    const cards = page.locator('.publication-grid > .publication-card');
    const wideCards = await cards.evaluateAll((elements) =>
      elements.map((element) => {
        const card = element as HTMLElement;
        return { x: card.offsetLeft, y: card.offsetTop };
      }),
    );
    expect(new Set(wideCards.map((box) => box.x)).size).toBe(1);
    expect(wideCards[1].y).toBeGreaterThan(wideCards[0].y);

    for (const card of await cards.all()) {
      const figureBox = await card.locator('.publication-card__figure').boundingBox();
      const headingBox = await card.getByRole('heading').boundingBox();
      expect(figureBox).not.toBeNull();
      expect(headingBox).not.toBeNull();
      expect(headingBox!.x).toBeGreaterThanOrEqual(figureBox!.x + figureBox!.width - 2);
      expect(Math.abs(headingBox!.y - figureBox!.y)).toBeLessThan(120);
    }

    await page.setViewportSize({ width: 375, height: 900 });
    await openHome(page);
    const narrowCards = await cards.evaluateAll((elements) =>
      elements.map((element) => ({ x: (element as HTMLElement).offsetLeft })),
    );
    expect(new Set(narrowCards.map((box) => box.x)).size).toBe(1);
    for (const card of await cards.all()) {
      const figureBox = await card.locator('.publication-card__figure').boundingBox();
      const headingBox = await card.getByRole('heading').boundingBox();
      expect(figureBox).not.toBeNull();
      expect(headingBox).not.toBeNull();
      expect(headingBox!.y).toBeGreaterThanOrEqual(figureBox!.y + figureBox!.height - 2);
    }
  });
});

test.describe('keyboard and theme behavior', () => {
  test('compact navigation appears only when links overflow', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openHome(page);
    await expect(page.locator('[data-nav-toggle]')).toBeHidden();

    await page.setViewportSize({ width: 375, height: 900 });
    await openHome(page);
    await expect(page.locator('[data-nav-toggle]')).toBeVisible();
  });

  test('Contact and compact navigation expose truthful keyboard state', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 900 });
    await openHome(page);

    for (const selector of ['[data-contact-toggle]', '[data-nav-toggle]']) {
      const toggle = page.locator(selector);
      await expect(toggle).toBeVisible();
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      const controlledId = await toggle.getAttribute('aria-controls');
      expect(controlledId).toBeTruthy();
      const controlled = page.locator(`#${controlledId}`);
      await expect(controlled).toBeHidden();

      await toggle.focus();
      await page.keyboard.press('Enter');
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
      await expect(controlled).toBeVisible();

      await page.keyboard.press('Space');
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      await expect(controlled).toBeHidden();

      await page.keyboard.press('Enter');
      await expect(controlled).toBeVisible();
      const firstControlledLink = controlled.getByRole('link').first();
      await page.keyboard.press('Tab');
      await expect(firstControlledLink).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      await expect(controlled).toBeHidden();
      await expect(toggle).toBeFocused();
    }
  });

  test('a section navigation link works from the keyboard', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await openHome(page);

    const link = page.locator('#site-nav').getByRole('link', { name: 'Publications', exact: true });
    await expect(link).toBeVisible();
    await link.focus();
    await page.keyboard.press('Enter');
    await expect.poll(() => page.evaluate(() => window.location.hash)).toBe('#publications');
    await expect(page.locator('#publications')).toBeInViewport();
  });

  test('theme toggle is keyboard operable, persistent, and updates browser chrome', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.setViewportSize({ width: 1280, height: 900 });
    await openHome(page);

    const toggle = page.locator('[data-theme-toggle]');
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    const lightThemeColor = await page.locator('meta[name="theme-color"]').getAttribute('content');
    expect(lightThemeColor).toMatch(/^#(?:[\da-f]{3}|[\da-f]{6})$/i);

    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect.poll(() => page.evaluate(() => localStorage.getItem('theme'))).toBe('dark');
    const darkThemeColor = await page.locator('meta[name="theme-color"]').getAttribute('content');
    expect(darkThemeColor).toMatch(/^#(?:[\da-f]{3}|[\da-f]{6})$/i);
    expect(darkThemeColor).not.toBe(lightThemeColor);

    await page.reload({ waitUntil: 'networkidle' });
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('[data-theme-toggle]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', darkThemeColor!);

    await page.locator('[data-theme-toggle]').focus();
    await page.keyboard.press('Space');
    await expect(page.locator('html')).not.toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('[data-theme-toggle]')).toHaveAttribute('aria-pressed', 'false');
    await expect.poll(() => page.evaluate(() => localStorage.getItem('theme'))).toBe('light');
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', lightThemeColor!);
  });

  test('body text retains readable contrast in light and dark themes', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await openHome(page);

    const bodyColors = async () => page.locator('body').evaluate((body) => {
      const styles = getComputedStyle(body);
      return { background: styles.backgroundColor, foreground: styles.color };
    });

    const light = await bodyColors();
    expect(contrastRatio(light.foreground, light.background)).toBeGreaterThanOrEqual(4.5);
    for (const selector of ['.research-card p', '.publication-card__authors', '.home-hero__advisor']) {
      const colors = await renderedColors(page, selector);
      expect(contrastRatio(colors.foreground, colors.background), `${selector} in light theme`).toBeGreaterThanOrEqual(4.5);
    }

    await page.locator('[data-theme-toggle]').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    const dark = await bodyColors();
    expect(contrastRatio(dark.foreground, dark.background)).toBeGreaterThanOrEqual(4.5);
    for (const selector of ['.research-card p', '.publication-card__authors', '.home-hero__advisor']) {
      const colors = await renderedColors(page, selector);
      expect(contrastRatio(colors.foreground, colors.background), `${selector} in dark theme`).toBeGreaterThanOrEqual(4.5);
    }
    expect(dark.background).not.toBe(light.background);
    expect(dark.foreground).not.toBe(light.foreground);
  });
});

test('reduced motion keeps content visible and removes smooth movement', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1280, height: 900 });
  await openHome(page);

  const motionSignals = await page.evaluate(() => {
    const cards = [...document.querySelectorAll<HTMLElement>('.research-card, .publication-card')];
    const newsItems = [...document.querySelectorAll<HTMLElement>('.news-timeline__item')];
    return {
      cardAnimationNames: cards.map((card) => getComputedStyle(card).animationName),
      cardOpacities: cards.map((card) => Number(getComputedStyle(card).opacity)),
      cardTransitionDurations: cards.map((card) => getComputedStyle(card).transitionDuration),
      scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
      newsItemOpacities: newsItems.map((item) => Number(getComputedStyle(item).opacity)),
    };
  });

  expect(motionSignals.scrollBehavior).toBe('auto');
  expect(motionSignals.cardOpacities.every((opacity) => opacity === 1)).toBe(true);
  expect(motionSignals.newsItemOpacities.every((opacity) => opacity === 1)).toBe(true);
  expect(motionSignals.cardAnimationNames.every((name) => name === 'none')).toBe(true);
  expect(
    motionSignals.cardTransitionDurations.every((durations) =>
      durations.split(',').every((duration) => Number.parseFloat(duration) === 0),
    ),
  ).toBe(true);
});
