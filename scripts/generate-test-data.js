const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const testDataDir = path.join(__dirname, '../test-data');
const mp3Dir = path.join(testDataDir, 'mp3');
const dbPath = path.join(testDataDir, 'luoo.db');

// Ensure directories exist
if (!fs.existsSync(testDataDir)) fs.mkdirSync(testDataDir);
if (!fs.existsSync(mp3Dir)) fs.mkdirSync(mp3Dir);

// Create dummy MP3 file
const dummyMp3Path = path.join(mp3Dir, 'test.mp3');
fs.writeFileSync(dummyMp3Path, 'ID3' + Buffer.alloc(100).toString()); // Fake MP3 header

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
        name TEXT,
        artist TEXT,
        album TEXT,
        src TEXT,
        length INTEGER,
        FOREIGN KEY(journal_id) REFERENCES journal(id)
    )`);

    // Insert Data
    const stmtJournal = db.prepare("INSERT INTO journal (vol, title, cover, desc) VALUES (?, ?, ?, ?)");
    const stmtTag = db.prepare("INSERT INTO tag (name) VALUES (?)");
    const stmtMapping = db.prepare("INSERT INTO journal_tag_mapping (journal_id, tag_id) VALUES (?, ?)");
    const stmtSong = db.prepare("INSERT INTO song (journal_id, name, artist, album, src, length) VALUES (?, ?, ?, ?, ?, ?)");

    // Tags
    stmtTag.run("民谣"); // Folk
    stmtTag.run("摇滚"); // Rock
    stmtTag.run("电子"); // Electronic
    stmtTag.finalize();

    // Journals
    for (let i = 1; i <= 20; i++) {
        stmtJournal.run(
            i.toString().padStart(3, '0'),
            `Test Journal ${i}`,
            `http://localhost:3001/cover/${i}.jpg`, // Dummy cover URL
            `This is a description for journal ${i}`
        );
    }
    stmtJournal.finalize();

    // Mappings (Random tags)
    for (let i = 1; i <= 20; i++) {
        stmtMapping.run(i, (i % 3) + 1);
    }
    stmtMapping.finalize();

    // Songs
    for (let i = 1; i <= 20; i++) {
        for (let j = 1; j <= 3; j++) {
            stmtSong.run(
                i,
                `Song ${j} of Journal ${i}`,
                `Artist ${j}`,
                `Album ${j}`,
                `http://localhost:3001/mp3/test.mp3`, // Point to dummy MP3
                200 // Length > 120
            );
        }
    }
    stmtSong.finalize();

    console.log('Test data generated successfully.');
});

db.close();
