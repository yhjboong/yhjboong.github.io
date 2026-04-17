import { test, expect } from '@playwright/test';

const viewports = [
  { name: '925px', width: 925, height: 900 },
  { name: '1024px', width: 1024, height: 900 },
  { name: '1100px', width: 1100, height: 900 },
  { name: '1280px', width: 1280, height: 900 },
  { name: '1440px', width: 1440, height: 900 },
];

for (const vp of viewports) {
  test(`sidebar does not overlap main content at ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const sidebar = page.locator('.sidebar');
    const content = page.locator('.page');

    const sidebarVisible = await sidebar.isVisible();
    if (!sidebarVisible) {
      // Sidebar hidden at this viewport (mobile), skip overlap check
      return;
    }

    const sidebarBox = await sidebar.boundingBox();
    const contentBox = await content.boundingBox();

    expect(sidebarBox).not.toBeNull();
    expect(contentBox).not.toBeNull();

    if (sidebarBox && contentBox) {
      // The content left edge should be >= sidebar right edge (no overlap)
      const sidebarRight = sidebarBox.x + sidebarBox.width;
      const gap = contentBox.x - sidebarRight;

      console.log(`[${vp.name}] sidebar right: ${sidebarRight}px, content left: ${contentBox.x}px, gap: ${gap}px`);

      expect(gap, `Content overlaps sidebar by ${-gap}px at ${vp.name}`).toBeGreaterThanOrEqual(0);
    }
  });
}
