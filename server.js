const express = require("express");
const Database = require("better-sqlite3");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const db = new Database("./data/site.db");

db.exec(`
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY,
    admin_name TEXT NOT NULL,
    admin_password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS visits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visitor_id TEXT UNIQUE,
    first_visit TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    parent_id INTEGER DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    text TEXT NOT NULL,
    category_id INTEGER,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS salaries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    engineering TEXT NOT NULL,
    sector TEXT NOT NULL,
    year INTEGER NOT NULL,
    salary TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS universities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    score TEXT,
    ranking TEXT
);

CREATE TABLE IF NOT EXISTS news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    text TEXT NOT NULL,
    created_at TEXT NOT NULL
);
`);

const admin = db.prepare("SELECT * FROM settings WHERE id = 1").get();

if (!admin) {
    db.prepare(`
        INSERT INTO settings (id, admin_name, admin_password)
        VALUES (1, ?, ?)
    `).run("Berat Buğra Zorlu", "123456");
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

app.get("/admin", (req, res) => {
    res.sendFile(path.join(__dirname, "admin", "index.html"));
});

app.get("/api/settings", (req, res) => {
    const settings = db.prepare(
        "SELECT admin_name FROM settings WHERE id = 1"
    ).get();

    res.json(settings);
});

app.post("/api/login", (req, res) => {
    const { name, password } = req.body;

    const admin = db.prepare(
        "SELECT * FROM settings WHERE id = 1"
    ).get();

    if (
        name === admin.admin_name &&
        password === admin.admin_password
    ) {
        res.json({
            success: true,
            message: "Giriş başarılı"
        });
    } else {
        res.status(401).json({
            success: false,
            message: "Kullanıcı adı veya şifre yanlış"
        });
    }
});

app.get("/api/categories", (req, res) => {
    const categories = db.prepare(
        "SELECT * FROM categories ORDER BY name"
    ).all();

    res.json(categories);
});

app.post("/api/categories", (req, res) => {
    const { name, parent_id } = req.body;

    if (!name) {
        return res.status(400).json({
            error: "Kategori adı gerekli"
        });
    }

    const result = db.prepare(`
        INSERT INTO categories (name, parent_id)
        VALUES (?, ?)
    `).run(name, parent_id || null);

    res.json({
        success: true,
        id: result.lastInsertRowid
    });
});

app.delete("/api/categories/:id", (req, res) => {
    db.prepare(
        "DELETE FROM categories WHERE id = ?"
    ).run(req.params.id);

    res.json({ success: true });
});

app.get("/api/content", (req, res) => {
    const content = db.prepare(`
        SELECT content.*, categories.name AS category_name
        FROM content
        LEFT JOIN categories
        ON content.category_id = categories.id
        ORDER BY content.id DESC
    `).all();

    res.json(content);
});

app.post("/api/content", (req, res) => {
    const { title, text, category_id } = req.body;

    if (!title || !text) {
        return res.status(400).json({
            error: "Başlık ve içerik gerekli"
        });
    }

    const result = db.prepare(`
        INSERT INTO content
        (title, text, category_id, created_at)
        VALUES (?, ?, ?, ?)
    `).run(
        title,
        text,
        category_id || null,
        new Date().toISOString()
    );

    res.json({
        success: true,
        id: result.lastInsertRowid
    });
});

app.delete("/api/content/:id", (req, res) => {
    db.prepare(
        "DELETE FROM content WHERE id = ?"
    ).run(req.params.id);

    res.json({ success: true });
});

app.get("/api/salaries", (req, res) => {
    const salaries = db.prepare(`
        SELECT *
        FROM salaries
        ORDER BY year DESC
    `).all();

    res.json(salaries);
});

app.post("/api/salaries", (req, res) => {
    const {
        engineering,
        sector,
        year,
        salary
    } = req.body;

    if (!engineering || !sector || !year || !salary) {
        return res.status(400).json({
            error: "Tüm alanları doldur"
        });
    }

    const result = db.prepare(`
        INSERT INTO salaries
        (engineering, sector, year, salary)
        VALUES (?, ?, ?, ?)
    `).run(
        engineering,
        sector,
        year,
        salary
    );

    res.json({
        success: true,
        id: result.lastInsertRowid
    });
});

app.get("/api/universities", (req, res) => {
    const universities = db.prepare(`
        SELECT *
        FROM universities
        ORDER BY name
    `).all();

    res.json(universities);
});

app.post("/api/universities", (req, res) => {
    const {
        name,
        department,
        score,
        ranking
    } = req.body;

    if (!name || !department) {
        return res.status(400).json({
            error: "Üniversite ve bölüm gerekli"
        });
    }

    const result = db.prepare(`
        INSERT INTO universities
        (name, department, score, ranking)
        VALUES (?, ?, ?, ?)
    `).run(
        name,
        department,
        score || "",
        ranking || ""
    );

    res.json({
        success: true,
        id: result.lastInsertRowid
    });
});

app.get("/api/news", (req, res) => {
    const news = db.prepare(`
        SELECT *
        FROM news
        ORDER BY id DESC
    `).all();

    res.json(news);
});

app.post("/api/news", (req, res) => {
    const { title, text } = req.body;

    if (!title || !text) {
        return res.status(400).json({
            error: "Başlık ve haber metni gerekli"
        });
    }

    const result = db.prepare(`
        INSERT INTO news
        (title, text, created_at)
        VALUES (?, ?, ?)
    `).run(
        title,
        text,
        new Date().toISOString()
    );

    res.json({
        success: true,
        id: result.lastInsertRowid
    });
});

app.post("/api/visit", (req, res) => {
    const visitorId = req.body.visitor_id;

    if (!visitorId) {
        return res.status(400).json({
            error: "visitor_id gerekli"
        });
    }

    db.prepare(`
        INSERT OR IGNORE INTO visits
        (visitor_id, first_visit)
        VALUES (?, ?)
    `).run(
        visitorId,
        new Date().toISOString()
    );

    const total = db.prepare(
        "SELECT COUNT(*) AS count FROM visits"
    ).get();

    res.json({
        total: total.count
    });
});

app.get("/api/stats", (req, res) => {
    const visitors = db.prepare(
        "SELECT COUNT(*) AS count FROM visits"
    ).get().count;

    const content = db.prepare(
        "SELECT COUNT(*) AS count FROM content"
    ).get().count;

    const categories = db.prepare(
        "SELECT COUNT(*) AS count FROM categories"
    ).get().count;

    const universities = db.prepare(
        "SELECT COUNT(*) AS count FROM universities"
    ).get().count;

    res.json({
        visitors,
        content,
        categories,
        universities
    });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log("");
    console.log("=================================");
    console.log(" MÜHENDİSLİK MERKEZİ");
    console.log(" Backend çalışıyor!");
    console.log("=================================");
    console.log("");
    console.log(`Site: http://localhost:${PORT}`);
    console.log(`Admin: http://localhost:${PORT}/admin`);
    console.log("");
});
