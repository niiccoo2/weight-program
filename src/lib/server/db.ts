// @ts-ignore: no type declarations for better-sqlite3
import Database from 'better-sqlite3';
import { building } from '$app/environment';
import fs from 'node:fs';
import path from 'node:path';

let db: any = null;
let saveWeightStmt: any = null;
let getWeightsStmt: any = null;

function initDb() {
	if (db) return;

	const dbPath = process.env.DB_PATH ?? 'weights.sqlite';
	console.log('Using DB at', dbPath);

	const dir = path.dirname(dbPath);
	if (dir && dir !== '.' && !fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}

	db = new Database(dbPath);

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

	saveWeightStmt = db.prepare(`
INSERT INTO weights (name, weight, time, scale_id, auth_id)
VALUES (@name, @weight, @time, @scale_id, @auth_id)
`);

	getWeightsStmt = db.prepare(`
SELECT * FROM weights    
`);
}

if (!building) {
	initDb();
}

export const saveWeight = {
	run: (...args: any[]) => {
		initDb();
		return saveWeightStmt.run(...args);
	}
};

export const getWeights = {
	all: (...args: any[]) => {
		initDb();
		return getWeightsStmt.all(...args);
	},
	get: (...args: any[]) => {
		initDb();
		return getWeightsStmt.get(...args);
	}
};
