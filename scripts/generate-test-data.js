const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const testDataDir = path.join(__dirname, '../test-data');
const volsDir = path.join(testDataDir, 'vols');
const dbPath = path.join(testDataDir, 'luoo.db');

// Ensure directories exist
if (!fs.existsSync(testDataDir)) fs.mkdirSync(testDataDir);
if (!fs.existsSync(volsDir)) fs.mkdirSync(volsDir);

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // Create Tables
    db.run(`CREATE TABLE IF NOT EXISTS journal (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vol TEXT,
        title TEXT,
        cover TEXT,
        desc TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS tag (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS journal_tag_mapping (
        journal_id INTEGER,
        tag_id INTEGER,
        FOREIGN KEY(journal_id) REFERENCES journal(id),
        FOREIGN KEY(tag_id) REFERENCES tag(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS song (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        journal_id INTEGER,
        title TEXT,
        artist TEXT,
        album TEXT,
        cover_url TEXT,
        lrc_url TEXT,
        download_url TEXT,
        nemid TEXT,
        length INTEGER,
        path TEXT,
        FOREIGN KEY(journal_id) REFERENCES journal(id)
    )`);

    // Insert Data
    const stmtJournal = db.prepare("INSERT INTO journal (vol, title, cover, desc) VALUES (?, ?, ?, ?)");
    const stmtTag = db.prepare("INSERT INTO tag (name) VALUES (?)");
    const stmtMapping = db.prepare("INSERT INTO journal_tag_mapping (journal_id, tag_id) VALUES (?, ?)");
    const stmtSong = db.prepare("INSERT INTO song (journal_id, title, artist, album, length, path) VALUES (?, ?, ?, ?, ?, ?)");

    // Tags
    stmtTag.run("民谣"); // Folk
    stmtTag.run("摇滚"); // Rock
    stmtTag.run("电子"); // Electronic
    stmtTag.finalize();

    // Journals & Songs
    for (let i = 1; i <= 20; i++) {
        const vol = i.toString().padStart(3, '0');
        const title = `Test Journal ${i}`;
        const folderName = `${vol}-${title}`;
        const journalDir = path.join(volsDir, folderName);

        if (!fs.existsSync(journalDir)) fs.mkdirSync(journalDir);

        stmtJournal.run(
            vol,
            title,
            `http://localhost:3001/cover/${i}.jpg`,
            `This is a description for journal ${i}`
        );

        // Songs
        for (let j = 1; j <= 3; j++) {
            const songName = `Song ${j}.mp3`;
            const songPath = path.join(journalDir, songName);
            fs.writeFileSync(songPath, 'ID3' + Buffer.alloc(100).toString()); // Dummy MP3

            // DB path uses backslashes typically in this dataset, or matching folder structure
            // We'll use the folder name + filename
            const dbSongPath = `${folderName}\\${songName}`;

            stmtSong.run(
                i,
                `Song ${j}`,
                `Artist ${j}`,
                `Album ${j}`,
                200,
                dbSongPath
            );
        }
    }
    stmtJournal.finalize();
    stmtSong.finalize();

    // Mappings (Random tags)
    for (let i = 1; i <= 20; i++) {
        stmtMapping.run(i, (i % 3) + 1);
    }
    stmtMapping.finalize();

    console.log('Test data generated successfully.');
});

db.close();
