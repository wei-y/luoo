const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../data/luoo.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database ' + dbPath + ': ' + err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

const getJournals = (page = 1, limit = 12, tagIds = []) => {
    const offset = (page - 1) * limit;
    return new Promise((resolve, reject) => {
        let query = `SELECT j.*, GROUP_CONCAT(t.id || ':::' || t.name, '|||') as tags_str
                     FROM journal j
                     LEFT JOIN journal_tag_mapping jtm ON j.id = jtm.journal_id
                     LEFT JOIN tag t ON jtm.tag_id = t.id`;

        const params = [];

        if (tagIds.length > 0) {
            // Use a subquery to find matching journal IDs to avoid Cartesian product in the main query
            query = `SELECT j.*, GROUP_CONCAT(t.id || ':::' || t.name, '|||') as tags_str
                     FROM journal j
                     LEFT JOIN journal_tag_mapping jtm ON j.id = jtm.journal_id
                     LEFT JOIN tag t ON jtm.tag_id = t.id
                     WHERE j.id IN (
                        SELECT jtm_filter.journal_id
                        FROM journal_tag_mapping jtm_filter
                        WHERE jtm_filter.tag_id IN (${tagIds.map(() => '?').join(',')})
                        GROUP BY jtm_filter.journal_id
                        HAVING COUNT(DISTINCT jtm_filter.tag_id) = ?
                     )
                     GROUP BY j.id
                     ORDER BY CAST(j.vol as INTEGER) ASC
                     LIMIT ? OFFSET ?`;
            params.push(...tagIds);
            params.push(tagIds.length);
            params.push(limit, offset);
        } else {
            query += ` GROUP BY j.id
                       ORDER BY CAST(j.vol as INTEGER) ASC
                       LIMIT ? OFFSET ?`;
            params.push(limit, offset);
        }

        db.all(query, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        }
        );
    });
};

const getJournalById = (id) => {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT j.*, GROUP_CONCAT(t.id || ':::' || t.name, '|||') as tags_str
             FROM journal j
             LEFT JOIN journal_tag_mapping jtm ON j.id = jtm.journal_id
             LEFT JOIN tag t ON jtm.tag_id = t.id
             WHERE j.id = ?
             GROUP BY j.id`,
            [id],
            (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
    });
};

const getSongsByJournalId = (journalId) => {
    return new Promise((resolve, reject) => {
        // Filter out songs with length < 120 or length = -1 (which is covered by < 120)
        db.all(
            `SELECT * FROM song WHERE journal_id = ? AND length >= 120 ORDER BY id ASC`,
            [journalId],
            (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            }
        );
    });
};

const getTags = () => {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT t.id, t.name, COUNT(jtm.journal_id) as count
             FROM tag t
             LEFT JOIN journal_tag_mapping jtm ON t.id = jtm.tag_id
             GROUP BY t.id
             ORDER BY count DESC`,
            [],
            (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
    });
};

const getJournalsByTagId = (tagId, page = 1, limit = 12) => {
    const offset = (page - 1) * limit;
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT j.*, GROUP_CONCAT(t.id || ':::' || t.name, '|||') as tags_str
             FROM journal j
             JOIN journal_tag_mapping jtm ON j.id = jtm.journal_id
             LEFT JOIN journal_tag_mapping jtm2 ON j.id = jtm2.journal_id
             LEFT JOIN tag t ON jtm2.tag_id = t.id
             WHERE jtm.tag_id = ?
             GROUP BY j.id
             ORDER BY CAST(j.vol as INTEGER) ASC
             LIMIT ? OFFSET ?`,
            [tagId, limit, offset],
            (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            }
        );
    });
};

const getTotalJournalsCount = (tagIds = []) => {
    return new Promise((resolve, reject) => {
        let query = `SELECT COUNT(*) as count FROM journal`;
        const params = [];

        if (tagIds.length > 0) {
            query = `SELECT COUNT(*) as count FROM (
                        SELECT j.id
                        FROM journal j
                        JOIN journal_tag_mapping jtm ON j.id = jtm.journal_id
                        WHERE jtm.tag_id IN (${tagIds.map(() => '?').join(',')})
                        GROUP BY j.id
                        HAVING COUNT(DISTINCT jtm.tag_id) = ?
                     )`;
            params.push(...tagIds);
            params.push(tagIds.length);
        }

        db.get(query, params, (err, row) => {
            if (err) reject(err);
            else resolve(row ? row.count : 0);
        });
    });
};

const getTotalJournalsByTagCount = (tagId) => {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT COUNT(*) as count FROM journal j
             JOIN journal_tag_mapping jtm ON j.id = jtm.journal_id
             WHERE jtm.tag_id = ?`,
            [tagId],
            (err, row) => {
                if (err) reject(err);
                else resolve(row.count);
            }
        );
    });
}


module.exports = {
    getJournals,
    getJournalById,
    getSongsByJournalId,
    getTags,
    getJournalsByTagId,
    getTotalJournalsCount,
    getTotalJournalsByTagCount
};
