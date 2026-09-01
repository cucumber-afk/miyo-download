import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { VpsDatabase, migrateDatabase } from '../server/db/sqlite.js';
import { getConfig } from '../server/config.js';

const config = getConfig();
const db = new VpsDatabase(config.dbPath);
migrateDatabase(db, path.resolve(fileURLToPath(new URL('../migrations', import.meta.url))));
console.log(`SQLite migrations applied: ${config.dbPath}`);
db.close();
