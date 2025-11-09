// === DASHBOARD SERVER ===
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ 1. Serve everything inside /dashboard/public

console.log("🧭 __dirname:", __dirname);
console.log("📂 Serving static from:", path.join(__dirname, "public"));

app.use(express.static(path.join(__dirname, "public")));

// ✅ 2. Serve the HTML page
app.get("/images/dedenne.png", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "images", "dedenne.png"));
});


app.get("/", (req, res) => {
  console.log("Request: /");
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

import fs from "fs";

console.log("🔍 Listing files in public/images:");
const imgDir = path.join(__dirname, "public", "images");
if (fs.existsSync(imgDir)) {
  console.log(fs.readdirSync(imgDir));
} else {
  console.log("⚠️  public/images folder not found at:", imgDir);
}


app.listen(PORT, () =>
  console.log(`✅ Dashboard running on http://localhost:${PORT}`)
);
