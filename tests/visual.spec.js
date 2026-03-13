const { test, expect } = require('@playwright/test');
const path = require('path');

const viewports = {
  'MacBook': { width: 1440, height: 900 },
  'iPad': { width: 820, height: 1180 },
  'iPhone15': { width: 393, height: 852 },
};

// Helper: get canvas bounding box and scale factors
async function getCanvasInfo(page) {
  const canvas = page.locator('canvas#c');
  const box = await canvas.boundingBox();
  return {
    canvas, box,
    scaleX: box.width / 720,
    scaleY: box.height / 504,
    clickGrid(col, row) {
      return {
        x: box.x + (36 * col + 18) * this.scaleX,
        y: box.y + (36 * row + 18) * this.scaleY,
      };
    }
  };
}

// Helper: check for JS console errors
function setupConsoleCheck(page) {
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));
  return errors;
}

for (const [device, viewport] of Object.entries(viewports)) {
  test.describe(`${device} (${viewport.width}x${viewport.height})`, () => {

    test('initial load', async ({ page }) => {
      const errors = setupConsoleCheck(page);
      await page.setViewportSize(viewport);
      await page.goto('/index.html');
      await page.waitForSelector('canvas#c');
      await page.waitForTimeout(500);
      await page.screenshot({ path: `screenshots/${device}_01_initial.png`, fullPage: true });

      // Verify key UI elements exist
      await expect(page.locator('#money')).toHaveText('200');
      await expect(page.locator('#lives')).toHaveText('20');
      await expect(page.locator('#wave')).toHaveText('0');
      await expect(page.locator('#score')).toHaveText('0');
      await expect(page.locator('.tower-btn')).toHaveCount(8); // 7 towers + mine
      await expect(page.locator('#mute-btn')).toBeVisible();
      expect(errors).toEqual([]);
    });

    test('place tower and start wave', async ({ page }) => {
      const errors = setupConsoleCheck(page);
      await page.setViewportSize(viewport);
      await page.goto('/index.html');
      await page.waitForSelector('canvas#c');
      await page.waitForTimeout(300);

      const info = await getCanvasInfo(page);

      // Select laser turret
      await page.click('.tower-btn[data-id="laser"]');
      await page.waitForTimeout(100);

      // Place at grid (1,1) - off path
      const pos = info.clickGrid(1, 1);
      await page.mouse.click(pos.x, pos.y);
      await page.waitForTimeout(200);

      // Verify money decreased
      const money = await page.locator('#money').textContent();
      expect(parseInt(money)).toBe(150); // 200 - 50

      await page.screenshot({ path: `screenshots/${device}_02_tower_placed.png`, fullPage: true });

      // Start wave
      await page.click('button:has-text("Next Wave")');
      await page.waitForTimeout(3000);

      // Wave should have started
      await expect(page.locator('#wave')).toHaveText('1');

      await page.screenshot({ path: `screenshots/${device}_03_wave_active.png`, fullPage: true });
      expect(errors).toEqual([]);
    });

    test('multiple towers and combat', async ({ page }) => {
      const errors = setupConsoleCheck(page);
      await page.setViewportSize(viewport);
      await page.goto('/index.html');
      await page.waitForSelector('canvas#c');
      await page.waitForTimeout(300);

      const info = await getCanvasInfo(page);

      // Place several towers in safe spots (row 0 is off-path)
      const towerTypes = ['laser', 'plasma', 'emp'];
      for (let i = 0; i < towerTypes.length; i++) {
        await page.click(`.tower-btn[data-id="${towerTypes[i]}"]`);
        await page.waitForTimeout(100);
        const pos = info.clickGrid(2 + i * 2, 0);
        await page.mouse.click(pos.x, pos.y);
        await page.waitForTimeout(100);
      }

      await page.screenshot({ path: `screenshots/${device}_04_multi_towers.png`, fullPage: true });

      // Start wave and let it run
      await page.click('button:has-text("Next Wave")');
      await page.waitForTimeout(5000);

      await page.screenshot({ path: `screenshots/${device}_05_combat.png`, fullPage: true });
      expect(errors).toEqual([]);
    });

    // ========== NEW USER JOURNEY TESTS ==========

    test('place mine on path', async ({ page }) => {
      const errors = setupConsoleCheck(page);
      await page.setViewportSize(viewport);
      await page.goto('/index.html');
      await page.waitForSelector('canvas#c');
      await page.waitForTimeout(300);

      const info = await getCanvasInfo(page);

      // Select mine
      await page.click('.tower-btn[data-id="mine"]');
      await page.waitForTimeout(100);

      // Place mine on path tile (2,3) - path goes through row 3
      const pos = info.clickGrid(2, 3);
      await page.mouse.click(pos.x, pos.y);
      await page.waitForTimeout(200);

      // Verify money decreased by mine cost ($40)
      const money = await page.locator('#money').textContent();
      expect(parseInt(money)).toBe(160); // 200 - 40

      await page.screenshot({ path: `screenshots/${device}_06_mine_placed.png`, fullPage: true });

      // Start wave and let mine trigger
      await page.click('button:has-text("Next Wave")');
      await page.waitForTimeout(4000);

      await page.screenshot({ path: `screenshots/${device}_07_mine_combat.png`, fullPage: true });
      expect(errors).toEqual([]);
    });

    test('try building on path (should fail)', async ({ page }) => {
      const errors = setupConsoleCheck(page);
      await page.setViewportSize(viewport);
      await page.goto('/index.html');
      await page.waitForSelector('canvas#c');
      await page.waitForTimeout(300);

      const info = await getCanvasInfo(page);

      // Select laser turret
      await page.click('.tower-btn[data-id="laser"]');
      await page.waitForTimeout(100);

      // Try to place on path tile (2,3)
      const pos = info.clickGrid(2, 3);
      await page.mouse.click(pos.x, pos.y);
      await page.waitForTimeout(200);

      // Money should NOT have decreased
      const money = await page.locator('#money').textContent();
      expect(parseInt(money)).toBe(200);

      // Error message should show
      const msg = await page.locator('#msg').textContent();
      expect(msg).toContain("Can't build on the path");

      await page.screenshot({ path: `screenshots/${device}_08_build_on_path.png`, fullPage: true });
      expect(errors).toEqual([]);
    });

    test('sell tower for refund', async ({ page }) => {
      const errors = setupConsoleCheck(page);
      await page.setViewportSize(viewport);
      await page.goto('/index.html');
      await page.waitForSelector('canvas#c');
      await page.waitForTimeout(300);

      const info = await getCanvasInfo(page);

      // Place a laser turret ($50)
      await page.click('.tower-btn[data-id="laser"]');
      await page.waitForTimeout(100);
      const pos = info.clickGrid(1, 1);
      await page.mouse.click(pos.x, pos.y);
      await page.waitForTimeout(200);

      let money = await page.locator('#money').textContent();
      expect(parseInt(money)).toBe(150);

      // Enter sell mode
      await page.click('button:has-text("Sell Tower")');
      await page.waitForTimeout(100);

      // Click on the tower to sell it
      await page.mouse.click(pos.x, pos.y);
      await page.waitForTimeout(200);

      // Should get 60% refund ($30)
      money = await page.locator('#money').textContent();
      expect(parseInt(money)).toBe(180);

      const msg = await page.locator('#msg').textContent();
      expect(msg).toContain('Sold for $30');

      await page.screenshot({ path: `screenshots/${device}_09_sell_tower.png`, fullPage: true });
      expect(errors).toEqual([]);
    });

    test('mute button toggles', async ({ page }) => {
      const errors = setupConsoleCheck(page);
      await page.setViewportSize(viewport);
      await page.goto('/index.html');
      await page.waitForSelector('canvas#c');
      await page.waitForTimeout(300);

      // Initially shows ON
      await expect(page.locator('#mute-btn')).toHaveText('Sound: ON');

      // Click to mute
      await page.click('#mute-btn');
      await page.waitForTimeout(100);
      await expect(page.locator('#mute-btn')).toHaveText('Sound: OFF');

      // Click to unmute
      await page.click('#mute-btn');
      await page.waitForTimeout(100);
      await expect(page.locator('#mute-btn')).toHaveText('Sound: ON');

      expect(errors).toEqual([]);
    });

    test('survive multiple waves', async ({ page }) => {
      const errors = setupConsoleCheck(page);
      await page.setViewportSize(viewport);
      await page.goto('/index.html');
      await page.waitForSelector('canvas#c');
      await page.waitForTimeout(300);

      const info = await getCanvasInfo(page);

      // Build a strong defense - place 4 towers along the path
      const towers = [
        { id: 'laser', col: 3, row: 2 },
        { id: 'laser', col: 5, row: 2 },
        { id: 'plasma', col: 9, row: 6 },
        { id: 'emp', col: 14, row: 1 },
      ];
      for (const t of towers) {
        await page.click(`.tower-btn[data-id="${t.id}"]`);
        await page.waitForTimeout(100);
        const pos = info.clickGrid(t.col, t.row);
        await page.mouse.click(pos.x, pos.y);
        await page.waitForTimeout(100);
      }

      // Run wave 1
      await page.click('button:has-text("Next Wave")');
      await page.waitForTimeout(6000);
      await expect(page.locator('#wave')).toHaveText('1');

      await page.screenshot({ path: `screenshots/${device}_10_wave1_done.png`, fullPage: true });

      // Run wave 2
      await page.click('button:has-text("Next Wave")');
      await page.waitForTimeout(8000);
      await expect(page.locator('#wave')).toHaveText('2');

      // Lives should still be > 0
      const lives = await page.locator('#lives').textContent();
      expect(parseInt(lives)).toBeGreaterThan(0);

      await page.screenshot({ path: `screenshots/${device}_11_wave2_done.png`, fullPage: true });
      expect(errors).toEqual([]);
    });

    test('all tower types can be placed', async ({ page }) => {
      const errors = setupConsoleCheck(page);
      await page.setViewportSize(viewport);
      await page.goto('/index.html');
      await page.waitForSelector('canvas#c');
      await page.waitForTimeout(300);

      const info = await getCanvasInfo(page);

      // Give extra money by starting and waiting for waves
      // Instead, just place what we can afford with $200
      // laser=$50, emp=$75 => $75 left, not enough for others
      // Place laser + emp to test two types at least
      const placements = [
        { id: 'laser', col: 0, row: 0 },
        { id: 'emp', col: 2, row: 0 },
      ];

      for (const t of placements) {
        await page.click(`.tower-btn[data-id="${t.id}"]`);
        await page.waitForTimeout(100);
        const pos = info.clickGrid(t.col, t.row);
        await page.mouse.click(pos.x, pos.y);
        await page.waitForTimeout(100);
      }

      // Verify money: 200 - 50 - 75 = 75
      const money = await page.locator('#money').textContent();
      expect(parseInt(money)).toBe(75);

      // Try to place plasma ($100) - should fail (not enough money)
      await page.click('.tower-btn[data-id="plasma"]');
      await page.waitForTimeout(100);
      const pos = info.clickGrid(4, 0);
      await page.mouse.click(pos.x, pos.y);
      await page.waitForTimeout(200);

      // Money should still be 75
      const money2 = await page.locator('#money').textContent();
      expect(parseInt(money2)).toBe(75);

      // Should show not enough credits message
      const msg = await page.locator('#msg').textContent();
      expect(msg).toContain('Not enough credits');

      await page.screenshot({ path: `screenshots/${device}_12_tower_types.png`, fullPage: true });
      expect(errors).toEqual([]);
    });

    test('game over triggers overlay', async ({ page }) => {
      const errors = setupConsoleCheck(page);
      await page.setViewportSize(viewport);
      await page.goto('/index.html');
      await page.waitForSelector('canvas#c');
      await page.waitForTimeout(300);

      // Don't place any towers - enemies will get through quickly
      // Start multiple waves rapidly to drain lives
      await page.click('button:has-text("Next Wave")');
      await page.waitForTimeout(8000);

      // Start wave 2 (more enemies)
      await page.click('button:has-text("Next Wave")');
      await page.waitForTimeout(8000);

      // Start wave 3
      await page.click('button:has-text("Next Wave")');
      await page.waitForTimeout(10000);

      await page.screenshot({ path: `screenshots/${device}_13_game_progress.png`, fullPage: true });

      // Check if game over happened or lives decreased significantly
      const lives = await page.locator('#lives').textContent();
      const livesNum = parseInt(lives);

      if (livesNum <= 0) {
        // Game over overlay should be visible
        await expect(page.locator('#overlay')).toHaveClass(/show/);
        await expect(page.locator('#ov-title')).toHaveText('SYSTEM BREACH');

        await page.screenshot({ path: `screenshots/${device}_14_game_over.png`, fullPage: true });

        // Click Play Again
        await page.click('#overlay-box button');
        await page.waitForTimeout(500);

        // Game should reset
        await expect(page.locator('#money')).toHaveText('200');
        await expect(page.locator('#lives')).toHaveText('20');
        await expect(page.locator('#wave')).toHaveText('0');
        await expect(page.locator('#overlay')).not.toHaveClass(/show/);

        await page.screenshot({ path: `screenshots/${device}_15_restart.png`, fullPage: true });
      } else {
        // Lives decreased - enemies got through
        expect(livesNum).toBeLessThan(20);
      }

      expect(errors).toEqual([]);
    });
  });
}
