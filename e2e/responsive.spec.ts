import { test, expect } from '@playwright/test';

test.describe('Responsive Design', () => {
  const viewports = [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1920, height: 1080 },
  ];

  for (const viewport of viewports) {
    test(`should render correctly on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');
      
      // Check that the page loads without layout issues
      const logo = page.getByAltText('MedSafe Logo');
      await expect(logo).toBeVisible();
      
      // Take a screenshot for visual comparison
      await page.screenshot({ 
        path: `e2e/screenshots/${viewport.name.toLowerCase()}-landing.png`,
        fullPage: true 
      });
    });
  }
});
