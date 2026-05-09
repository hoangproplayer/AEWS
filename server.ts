import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("data.db");

// Initialize Database
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
  
  CREATE TABLE IF NOT EXISTS units (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    condition TEXT,
    level TEXT,
    status TEXT DEFAULT 'Active',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE TABLE IF NOT EXISTS counseling_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    studentId TEXT NOT NULL,
    studentName TEXT NOT NULL,
    reason TEXT NOT NULL,
    notes TEXT NOT NULL,
    commitment TEXT,
    date TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed data if empty
const studentCount = db.prepare("SELECT COUNT(*) as count FROM students").get() as { count: number };
if (studentCount.count === 0) {
    const insert = db.prepare("INSERT INTO students (id, name, class, gpa, level) VALUES (?, ?, ?, ?, ?)");
    insert.run('2012001', 'Nguyễn Văn A', '20CNTT1', 3.2, 'SAFE');
    insert.run('2012002', 'Trần Thị B', '20CNTT2', 1.8, 'WARNING');
    insert.run('2012003', 'Lê Văn C', '20CNTT1', 0.9, 'DANGER');
}

async function startServer() {
    const app = express();
    const PORT = 3000;

    app.use(express.json());

    // API Routes
    app.get("/api/counseling", (req, res) => {
        try {
            const logs = db.prepare("SELECT * FROM counseling_logs ORDER BY createdAt DESC").all();
            res.json(logs);
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    });

    app.post("/api/counseling", (req, res) => {
        const { studentId, studentName, reason, notes, date } = req.body;
        try {
            const result = db.prepare("INSERT INTO counseling_logs (studentId, studentName, reason, notes, date) VALUES (?, ?, ?, ?, ?)")
                .run(studentId, studentName, reason, notes, date);
            res.json({ success: true, id: result.lastInsertRowid });
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    });

    app.put("/api/counseling/:id", (req, res) => {
        const { id } = req.params;
        const { reason, notes, commitment, date } = req.body;
        try {
            db.prepare("UPDATE counseling_logs SET reason = ?, notes = ?, commitment = ?, date = ? WHERE id = ?")
                .run(reason, notes, commitment, date, id);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    });

    app.delete("/api/counseling/:id", (req, res) => {
        const { id } = req.params;
        try {
            db.prepare("DELETE FROM counseling_logs WHERE id = ?").run(id);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    });

    app.get("/api/students", (req, res) => {
        try {
            const students = db.prepare("SELECT * FROM students").all();
            res.json(students);
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    });

    app.post("/api/students", (req, res) => {
        const { id, name, gpa, level } = req.body;
        const className = req.body.class || req.body.class_name;
        try {
            db.prepare("INSERT INTO students (id, name, class, gpa, level) VALUES (?, ?, ?, ?, ?)")
                .run(id, name, className, gpa, level);
            res.json({ success: true });
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        }
    });

    app.get("/api/rules", (req, res) => {
        try {
            const rules = db.prepare("SELECT * FROM rules ORDER BY createdAt DESC").all();
            res.json(rules);
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    });

    app.post("/api/rules", (req, res) => {
        const { name, condition, level, status } = req.body;
        try {
            db.prepare("INSERT INTO rules (name, condition, level, status) VALUES (?, ?, ?, ?)")
                .run(name, condition, level, status || 'Active');
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    });

    app.post("/api/ai/predict-risk", (req, res) => {
        const { students } = req.body;
        if (!Array.isArray(students)) return res.status(400).json({ error: "Invalid input" });

        const predictions = students.map(student => {
            const gpa = student.gpa || 0;
            let risk_score = 0;
            if (gpa < 2.0) {
                risk_score = Math.floor(Math.random() * (100 - 80 + 1)) + 80;
            } else if (gpa < 2.5) {
                risk_score = Math.floor(Math.random() * (80 - 50 + 1)) + 50;
            } else {
                risk_score = Math.floor(Math.random() * (30 - 0 + 1)) + 0;
            }

            return {
                id: student.id,
                name: student.name,
                predictedRisk: risk_score,
                recommendation: risk_score > 70 ? "Can thiệp ngay" : risk_score > 40 ? "Theo dõi sát" : "Ổn định"
            };
        });

        res.json({ predictions });
    });

    app.get("/api/health", (req, res) => {
        res.json({ status: "ok", backend: "express" });
    });

    // Vite middleware
    if (process.env.NODE_ENV !== "production") {
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: "spa",
        });
        app.use(vite.middlewares);
    } else {
        const distPath = path.join(process.cwd(), "dist");
        app.use(express.static(distPath));
        app.get("*", (req, res) => {
            res.sendFile(path.join(distPath, "index.html"));
        });
    }

    app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}

startServer();
