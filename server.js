/* eslint-env node */
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// --- middleware ---
app.use(cors());
app.use(express.json());

// 1) Serve the bundled frontend from /dist
const DIST_DIR = path.join(__dirname, "dist");
app.use(express.static(DIST_DIR));

// 2) Health check
app.get("/ping", (_req, res) => res.json({ ok: true }));

// 3) API — serve animals from the built file in /dist
const ANIMALS_PATH = path.join(DIST_DIR, "animals.json");

app.get("/api/animals", (_req, res) => {
  fs.readFile(ANIMALS_PATH, "utf8", (err, data) => {
    if (err) {
      console.error("Unable to read animals.json:", err);
      return res.status(500).json({ error: "Unable to read animals.json" });
    }
    try {
      const animals = JSON.parse(data);
      res.json(animals);
    } catch (e) {
      console.error("Invalid JSON in animals.json:", e);
      res.status(500).json({ error: "Invalid JSON in animals.json" });
    }
  });
});

// 4) Optional: single animal by id (reads the same file)
app.get("/api/animals/:id", (req, res) => {
  fs.readFile(ANIMALS_PATH, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Unable to read animals.json" });
    try {
      const animals = JSON.parse(data);
      const id = parseInt(req.params.id, 10);
      const animal = animals.find(a => a.id === id);
      return animal ? res.json(animal) : res.status(404).json({ error: "Animal not found" });
    } catch (e) {
      console.error("Invalid JSON in animals.json:", e);
      res.status(500).json({ error: "Invalid JSON in animals.json" });
    }
  });
});

// 5) SPA fallback — send the built index.html for everything else
// SPA fallback — send the built index.html for everything else
app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(DIST_DIR, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🐾 Server running on http://localhost:${PORT}`);
});
