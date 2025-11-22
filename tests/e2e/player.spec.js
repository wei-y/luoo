const { test, expect } = require('@playwright/test');
const { HomePage } = require('../pages/HomePage');

test.describe('Player', () => {
    test('should start playing when clicking play on card overlay', async ({ page }) => {
        const homePage = new HomePage(page);
        await homePage.navigate();

        // Click play on the first card
        const firstCard = await homePage.getJournalCard(0);
        await firstCard.hover();
        await firstCard.locator('.play-overlay').click();

        // Check if player bar appears and is playing
        // Check if player bar appears
        const playerBar = page.locator('.player-bar');
        await expect(playerBar).toBeVisible();

        // Check for audio element
        const audio = playerBar.locator('audio');
        await expect(audio).toBeVisible();

        // Verify src attribute contains localhost
        const src = await audio.getAttribute('src');
        expect(src).toContain('http://localhost:3001');
    });
});
