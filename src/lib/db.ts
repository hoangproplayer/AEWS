import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data.db');
const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    class TEXT,
    gpa REAL DEFAULT 0,
    level TEXT DEFAULT 'SAFE',
    status TEXT DEFAULT 'ACTIVE',
    lastAnalyzed TEXT
  );

  CREATE TABLE IF NOT EXISTS counseling_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    studentId TEXT,
    studentName TEXT,
    reason TEXT,
    notes TEXT,
    date TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(studentId) REFERENCES students(id)
  );

  CREATE TABLE IF NOT EXISTS rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    condition TEXT,
    level TEXT,
    status TEXT DEFAULT 'Active',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed initial data if empty
const studentCount = db.prepare('SELECT COUNT(*) as count FROM students').get() as { count: number };
if (studentCount.count === 0) {
  const insert = db.prepare('INSERT INTO students (id, name, class, gpa, level) VALUES (?, ?, ?, ?, ?)');
  insert.run('2012001', 'Nguyễn Văn A', '20CNTT1', 3.2, 'SAFE');
  insert.run('2012002', 'Trần Thị B', '20CNTT2', 1.8, 'WARNING');
  insert.run('2012003', 'Lê Văn C', '20CNTT1', 0.9, 'DANGER');
}

export default db;
