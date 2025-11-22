const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const fs = require('fs');

// Serve static audio files
// The 'vols' directory contains the MP3 files
let audioPath;
try {
    audioPath = fs.realpathSync(path.resolve(__dirname, '../data/vols'));
} catch (e) {
    console.warn('Could not resolve real path for data/vols, using relative path:', e.message);
    audioPath = path.resolve(__dirname, '../data/vols');
}
console.log('Serving audio from:', audioPath);
app.use('/audio', express.static(audioPath));

// Map vol number to folder name
const volToFolderMap = {};
const initVolMap = () => {
    const volsDir = path.resolve(__dirname, '../data/vols');
    if (fs.existsSync(volsDir)) {
        const files = fs.readdirSync(volsDir);
        files.forEach(file => {
            // Assuming folder format: "1-Title" or just "1"
            // We extract the number part.
            const match = file.match(/^(\d+)-?/);
            if (match) {
                const vol = match[1];
                volToFolderMap[vol] = file;
            }
        });
        console.log(`Mapped ${Object.keys(volToFolderMap).length} volumes.`);
    } else {
        console.error("Volumes directory not found:", volsDir);
    }
};
initVolMap();

// API Routes

// Helper to process journal (attach cover URL and parse tags)
const processJournal = (journal) => {
    // Ensure vol is a string for lookup
    const volStr = String(journal.vol);
    let folder = volToFolderMap[volStr];

    // If not found, try refreshing the map (in case new data was added)
    if (!folder) {
        initVolMap();
        folder = volToFolderMap[volStr];
    }

    let coverUrl = journal.cover; // Default to DB value or whatever is there

    if (folder) {
        // Encode the folder name to handle Chinese characters and spaces safely in URLs
        const encodedFolder = encodeURIComponent(folder);
        coverUrl = `/audio/${encodedFolder}/cover.jpg`;
    } else {
        console.warn(`No folder found for Vol ${journal.vol}`);
    }

    // Parse tags
    let tags = [];
    if (journal.tags_str) {
        tags = journal.tags_str.split('|||').map(tagStr => {
            const [id, name] = tagStr.split(':::');
            let cleanName = name.replace(/^#/, '');
            if (cleanName === '[EMPTY]') {
                cleanName = 'No Tag';
            }
            return { id: parseInt(id), name: cleanName };
        });
    }

    return {
        ...journal,
        cover: coverUrl,
        tags
    };
};

// Get Journals (Volumes) with pagination
app.get('/api/journals', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 9;

        let tagIds = [];
        if (req.query.tags) {
            tagIds = [...new Set(req.query.tags.split(',').map(id => parseInt(id)).filter(id => !isNaN(id)))];
        }

        const journals = await db.getJournals(page, limit, tagIds);
        const total = await db.getTotalJournalsCount(tagIds);

        const processedJournals = journals.map(processJournal);

        res.json({
            data: processedJournals,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Journal Details
app.get('/api/journals/:id', async (req, res) => {
    try {
        const journal = await db.getJournalById(req.params.id);
        if (!journal) {
            return res.status(404).json({ error: 'Journal not found' });
        }
        res.json(processJournal(journal));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Songs for a Journal
app.get('/api/journals/:id/songs', async (req, res) => {
    try {
        const songs = await db.getSongsByJournalId(req.params.id);
        // Normalize paths for web usage
        const songsWithUrl = songs.map(song => {
            if (song.path) {
                return {
                    ...song,
                    src: `/audio/${song.path.replace(/\\/g, '/')}`
                };
            }
            return song; // Return as is if src is already set (e.g. test data)
        });
        res.json(songsWithUrl);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Tags
app.get('/api/tags', async (req, res) => {
    try {
        const tags = await db.getTags();
        const processedTags = tags.map(tag => {
            let cleanName = tag.name.replace(/^#/, '');
            if (cleanName === '[EMPTY]') {
                cleanName = 'No Tag';
            }
            return { ...tag, name: cleanName };
        });
        res.json(processedTags);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Journals by Tag
app.get('/api/tags/:id/journals', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 9;
        const journals = await db.getJournalsByTagId(req.params.id, page, limit);
        const total = await db.getTotalJournalsByTagCount(req.params.id);

        const processedJournals = journals.map(processJournal);

        res.json({
            data: processedJournals,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
