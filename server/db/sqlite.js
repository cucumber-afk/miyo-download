import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

export class VpsDatabase {
  constructor(filename) {
    fs.mkdirSync(path.dirname(filename), { recursive: true });
    this.connection = new Database(filename);
    this.connection.pragma('journal_mode = WAL');
    this.connection.pragma('foreign_keys = ON');
    this.connection.pragma('busy_timeout = 5000');
    this.connection.pragma('synchronous = NORMAL');
  }

  prepare(sql) {
    const db = this.connection;
    let values = [];
    const statement = () => db.prepare(sql);
    const api = {
      bind(...bindings) { values = bindings; return api; },
      first() { return statement().get(...values) || null; },
      all() { return { results: statement().all(...values) }; },
      run() { const result = statement().run(...values); return { success: true, meta: { changes: result.changes, last_row_id: result.lastInsertRowid } }; },
    };
    return api;
  }

  batch(statements) {
    const transaction = this.connection.transaction(() => statements.map((item) => item.run()));
    transaction();
    return { success: true };
  }

  close() { this.connection.close(); }
}

export function migrateDatabase(db, migrationsDirectory) {
  db.connection.exec('CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL)');
  const applied = new Set(db.connection.prepare('SELECT name FROM schema_migrations').all().map((row) => row.name));
  const files = fs.readdirSync(migrationsDirectory).filter((file) => file.endsWith('.sql')).sort();
  for (const name of files) {
    if (applied.has(name)) continue;
    const sql = fs.readFileSync(path.join(migrationsDirectory, name), 'utf8');
    const apply = db.connection.transaction(() => {
      db.connection.exec(sql);
      db.connection.prepare('INSERT INTO schema_migrations (name, applied_at) VALUES (?, ?)').run(name, new Date().toISOString());
    });
    apply();
  }
}
