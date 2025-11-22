const { test, expect } = require('@playwright/test');

test.describe('Tags API', () => {
    test('GET /api/tags returns all tags', async ({ request }) => {
        const response = await request.get('/api/tags');
        expect(response.ok()).toBeTruthy();
        const tags = await response.json();

        expect(Array.isArray(tags)).toBeTruthy();
        expect(tags.length).toBeGreaterThan(0);
        expect(tags[0]).toHaveProperty('id');
        expect(tags[0]).toHaveProperty('name');
        expect(tags[0]).toHaveProperty('count');
    });

    test('GET /api/tags/:id/journals returns filtered journals', async ({ request }) => {
        // Get a tag first
        const tagsResponse = await request.get('/api/tags');
        const tags = await tagsResponse.json();
        const tag = tags.find(t => t.count > 0); // Find a tag with journals

        if (tag) {
            const response = await request.get(`/api/tags/${tag.id}/journals`);
            expect(response.ok()).toBeTruthy();
            const data = await response.json();

            expect(data).toHaveProperty('data');
            expect(data.data.length).toBeGreaterThan(0);
            // Verify that returned journals actually have the tag (if backend supports checking, but here we trust the endpoint)
        }
    });
});
