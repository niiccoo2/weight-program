// @ts-ignore: no type declarations for better-sqlite3
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

const dbPath = process.env.DB_PATH ?? 'weights.sqlite';
console.log('Using DB at', dbPath);

// make sure the directory exists
const dir = path.dirname(dbPath);
if (dir && dir !== '.' && !fs.existsSync(dir)) {
	fs.mkdirSync(dir, { recursive: true });
}

const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');

db.exec(`
CREATE TABLE IF NOT EXISTS weights (
  name       TEXT NOT NULL,
  weight     REAL NOT NULL,
  time       INTEGER NOT NULL,
  scale_id   TEXT NOT NULL,
  auth_id    TEXT NOT NULL
);
`);

export const saveWeight = db.prepare(`
INSERT INTO weights (name, weight, time, scale_id, auth_id)
VALUES (@name, @weight, @time, @scale_id, @auth_id)
`);

export const getWeights = db.prepare(`
SELECT * FROM weights    
`);
