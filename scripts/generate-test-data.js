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

// Download sample MP3
const sampleMp3Url = 'https://github.com/mathiasbynens/small/raw/master/mp3.mp3';
const sampleMp3Path = path.join(testDataDir, 'sample.mp3');

console.log(`Downloading sample MP3 from ${sampleMp3Url}...`);

// Use fetch to download
fetch(sampleMp3Url)
    .then(res => {
        if (!res.ok) throw new Error(`Failed to download MP3: ${res.statusText}`);
        return res.arrayBuffer();
    })
    .then(buffer => {
        fs.writeFileSync(sampleMp3Path, Buffer.from(buffer));
        console.log('Sample MP3 downloaded.');

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

                // Copy icon.png as dummy cover
                const iconPath = path.join(__dirname, '../client/public/icon.png');
                const coverPath = path.join(journalDir, 'cover.jpg');
                if (fs.existsSync(iconPath)) {
                    fs.copyFileSync(iconPath, coverPath);
                }

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

                    // Copy downloaded sample MP3
                    fs.copyFileSync(sampleMp3Path, songPath);

                    // DB path uses backslashes typically in this dataset, or matching folder structure
                    // We'll use the folder name + filename
                    const dbSongPath = `${folderName}\\${songName}`;

                    stmtSong.run(
                        i,
                        `Journal ${i} - Song ${j}`,
                        `Artist ${j}`,
                        `Album ${j}`,
                        200,
                        dbSongPath
                    );
                }
            }
            stmtJournal.finalize();
            stmtSong.finalize();

            // Mappings (Assign 1-2 unique tags per journal)
            for (let i = 1; i <= 20; i++) {
                const numTags = (i % 2) + 1; // 1 or 2 tags
                const startTag = (i % 3) + 1;

                stmtMapping.run(i, startTag);
                if (numTags > 1) {
                    let nextTag = startTag + 1;
                    if (nextTag > 3) nextTag = 1;
                    stmtMapping.run(i, nextTag);
                }
            }
            stmtMapping.finalize();

            console.log('Test data generated successfully.');
        });

    })
    .catch(err => {
        console.error('Error generating test data:', err);
        process.exit(1);
    });
