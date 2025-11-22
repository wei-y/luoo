const { test, expect } = require('@playwright/test');

test.describe('Journals API', () => {
    test('GET /api/journals returns paginated journals', async ({ request }) => {
        const response = await request.get('/api/journals?page=1&limit=9');
        expect(response.ok()).toBeTruthy();
        const data = await response.json();

        expect(data).toHaveProperty('data');
        expect(data).toHaveProperty('pagination');
        expect(data.data.length).toBeLessThanOrEqual(9);
        expect(data.pagination).toHaveProperty('page', 1);
        expect(data.pagination).toHaveProperty('limit', 9);
    });

    test('GET /api/journals/:id returns journal details', async ({ request }) => {
        // First get a journal ID
        const listResponse = await request.get('/api/journals?page=1&limit=1');
        const listData = await listResponse.json();
        const journalId = listData.data[0].id;

        const response = await request.get(`/api/journals/${journalId}`);
        expect(response.ok()).toBeTruthy();
        const journal = await response.json();

        expect(journal).toHaveProperty('id', journalId);
        expect(journal).toHaveProperty('title');
        expect(journal).toHaveProperty('cover');
        expect(journal).toHaveProperty('tags');
    });

    test('GET /api/journals/:id/songs returns songs', async ({ request }) => {
        // First get a journal ID
        const listResponse = await request.get('/api/journals?page=1&limit=1');
        const listData = await listResponse.json();
        const journalId = listData.data[0].id;

        const response = await request.get(`/api/journals/${journalId}/songs`);
        expect(response.ok()).toBeTruthy();
        const songs = await response.json();

        expect(Array.isArray(songs)).toBeTruthy();
        if (songs.length > 0) {
            expect(songs[0]).toHaveProperty('id');
            expect(songs[0]).toHaveProperty('title');
            expect(songs[0]).toHaveProperty('src');
        }
    });
});
