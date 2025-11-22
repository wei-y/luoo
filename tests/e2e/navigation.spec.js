const { test, expect } = require('@playwright/test');
const { HomePage } = require('../pages/HomePage');
const { VolumeDetailPage } = require('../pages/VolumeDetailPage');

test.describe('Navigation', () => {
    test('should navigate from home to volume detail via title click', async ({ page }) => {
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('pageerror', exception => console.log(`PAGE ERROR: "${exception}"`));

        const homePage = new HomePage(page);
        await homePage.navigate();
        await expect(page).toHaveTitle(/client/);

        const firstCard = await homePage.getJournalCard(0);
        await firstCard.waitFor({ state: 'visible', timeout: 10000 });
        const title = await firstCard.locator('h3').innerText();
        console.log('Card Title:', title);

        await homePage.clickJournalTitle(0);
        console.log('Clicked title, waiting for navigation...');

        const detailPage = new VolumeDetailPage(page);
        await expect(page).toHaveURL(/\/journal\/\d+/);
        const detailTitle = await detailPage.getTitleText();
        console.log('Detail Title:', detailTitle);

        expect(detailTitle).toContain(title.split(' ')[1]); // Basic check, title format might differ slightly
    });

    test('should navigate from home to volume detail via hover button', async ({ page }) => {
        const homePage = new HomePage(page);
        await homePage.navigate();

        await homePage.clickJournalDetailsButton(0);

        await expect(page).toHaveURL(/\/journal\/\d+/);
    });
});
