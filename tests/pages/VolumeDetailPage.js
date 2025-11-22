const { BasePage } = require('./BasePage');

class VolumeDetailPage extends BasePage {
    constructor(page) {
        super(page);
        this.title = page.locator('h1');
        this.coverImage = page.locator('img[alt*="Vol."]');
        this.playButtonOverlay = page.locator('.play-overlay');
        this.tags = page.locator('.tag-link');
        this.description = page.locator('.journal-desc');
        this.playlistItems = page.locator('.playlist-item');
    }

    async getTitleText() {
        return await this.title.innerText();
    }

    async playSong(index) {
        await this.playlistItems.nth(index).click();
    }

    async clickCoverPlay() {
        await this.coverImage.hover();
        await this.playButtonOverlay.click();
    }
}

module.exports = { VolumeDetailPage };
