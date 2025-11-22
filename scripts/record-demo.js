const { chromium } = require('playwright');
const path = require('path');

(async () => {
    const browser = await chromium.launch({
        headless: true, // Headless for server environment, but video works
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext({
        recordVideo: {
            dir: 'demo-video',
            size: { width: 1280, height: 720 }
        },
        viewport: { width: 1280, height: 720 }
    });

    const page = await context.newPage();

    console.log('Navigating to home...');
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(2000);

    console.log('Scrolling...');
    await page.evaluate(() => window.scrollTo({ top: 500, behavior: 'smooth' }));
    await page.waitForTimeout(2000);

    console.log('Filtering by tag...');
    // Click the 3rd tag (index 2)
    await page.locator('.sidebar-tag').nth(2).click();
    await page.waitForTimeout(2000);

    console.log('Opening journal...');
    await page.locator('.card').first().click();
    await page.waitForTimeout(3000);

    console.log('Playing music...');
    // Click play on the cover overlay (more reliable)
    await page.locator('.play-btn-large').first().click();
    await page.waitForTimeout(5000);

    console.log('Closing...');
    await context.close();
    await browser.close();
})();
