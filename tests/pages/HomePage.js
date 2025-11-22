const { BasePage } = require('./BasePage');

class HomePage extends BasePage {
    constructor(page) {
        super(page);
        this.journalCards = page.locator('.card');
        this.sidebarTags = page.locator('.sidebar-tag');
        this.pageInput = page.locator('input[type="number"]');
        this.prevButton = page.getByText('❮');
        this.nextButton = page.getByText('❯');
    }

    async getJournalCard(index) {
        return this.journalCards.nth(index);
    }

    async clickJournalTitle(index) {
        await this.journalCards.nth(index).locator('h3').click();
    }

    async clickJournalDetailsButton(index) {
        const card = this.journalCards.nth(index);
        await card.hover();
        const btn = card.locator('.details-btn');
        await btn.waitFor({ state: 'visible' });
        await btn.click();
    }

    async selectTag(tagName) {
        await this.sidebarTags.filter({ hasText: tagName }).first().click();
    }

    async goToPage(pageNumber) {
        await this.pageInput.fill(String(pageNumber));
        await this.pageInput.press('Enter');
    }
}

module.exports = { HomePage };
