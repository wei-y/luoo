const { test, expect } = require('@playwright/test');
const { HomePage } = require('../pages/HomePage');

test.describe('Filtering', () => {
    test('should filter journals by tag', async ({ page }) => {
        const homePage = new HomePage(page);
        await homePage.navigate();

        // Click a tag in the sidebar
        // We need to pick a tag that is not "All Tags" or "No Tag"
        // Let's pick the first tag in the scrollable list
        const tagLink = homePage.sidebarTags.nth(2); // 0 is All, 1 is No Tag (if exists)
        const tagName = await tagLink.locator('span').first().innerText();
        console.log('Selected Tag:', tagName);

        await tagLink.click();

        // Check URL
        await expect(page).toHaveURL(/\?tags=\d+/);

        // Check selected tag chip (confirms state update and filtering)
        const chip = page.locator('.selected-tag-chip');
        await expect(chip).toBeVisible();
        await expect(chip).toContainText(tagName);
    });
});
