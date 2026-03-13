const { test, expect } = require('@playwright/test');
const path = require('path');

const viewports = {
  'MacBook': { width: 1440, height: 900 },
  'iPad': { width: 820, height: 1180 },
  'iPhone15': { width: 393, height: 852 },
};

for (const [device, viewport] of Object.entries(viewports)) {
  test.describe(`${device} (${viewport.width}x${viewport.height})`, () => {

    test('initial load', async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto('/index.html');
      await page.waitForSelector('canvas#c');
      await page.waitForTimeout(500);
      await page.screenshot({ path: `screenshots/${device}_01_initial.png`, fullPage: true });
    });

    test('place tower and start wave', async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto('/index.html');
      await page.waitForSelector('canvas#c');
      await page.waitForTimeout(300);

      // Select laser turret
      await page.click('.tower-btn[data-id="laser"]');
      await page.waitForTimeout(100);

      // Click on canvas to place tower (avoid path tiles)
      const canvas = page.locator('canvas#c');
      const box = await canvas.boundingBox();
      // Place at grid position roughly (1,1) - top left area, off path
      const clickX = box.x + 36 * 1.5 * (box.width / 720);
      const clickY = box.y + 36 * 1.5 * (box.height / 504);
      await page.mouse.click(clickX, clickY);
      await page.waitForTimeout(200);

      await page.screenshot({ path: `screenshots/${device}_02_tower_placed.png`, fullPage: true });

      // Start wave
      await page.click('button:has-text("Next Wave")');
      await page.waitForTimeout(3000);

      await page.screenshot({ path: `screenshots/${device}_03_wave_active.png`, fullPage: true });
    });

    test('multiple towers and combat', async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto('/index.html');
      await page.waitForSelector('canvas#c');
      await page.waitForTimeout(300);

      const canvas = page.locator('canvas#c');
      const box = await canvas.boundingBox();
      const scaleX = box.width / 720;
      const scaleY = box.height / 504;

      // Place several towers in safe spots (row 0 and row 1 are off-path)
      const towerTypes = ['laser', 'plasma', 'emp'];
      for (let i = 0; i < towerTypes.length; i++) {
        await page.click(`.tower-btn[data-id="${towerTypes[i]}"]`);
        await page.waitForTimeout(100);
        const tx = box.x + (36 * (2 + i * 2) + 18) * scaleX;
        const ty = box.y + (36 * 0 + 18) * scaleY;
        await page.mouse.click(tx, ty);
        await page.waitForTimeout(100);
      }

      await page.screenshot({ path: `screenshots/${device}_04_multi_towers.png`, fullPage: true });

      // Start wave and let it run
      await page.click('button:has-text("Next Wave")');
      await page.waitForTimeout(5000);

      await page.screenshot({ path: `screenshots/${device}_05_combat.png`, fullPage: true });
    });
  });
}
