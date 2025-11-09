<<<<<<< HEAD
// modesummary.js
import fs from "fs";
import path from "path";
import chalk from "chalk";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const guildDir = path.join(__dirname, "automod", "guilds");
if (!fs.existsSync(guildDir)) {
  console.log(chalk.red("❌ No /automod/guilds directory found."));
  process.exit(1);
}

console.log(chalk.yellow("⚙️ Alpha Dedenne Mode Summary\n"));

const files = fs.readdirSync(guildDir).filter(f => f.endsWith(".json"));
if (!files.length) {
  console.log(chalk.gray("No guild mode files found."));
  process.exit(0);
}

for (const file of files) {
  const guildId = file.replace(".json", "");
  try {
    const data = JSON.parse(fs.readFileSync(path.join(guildDir, file)));
    const mode =
      data.mode === 1 ? chalk.blue("1 — Nuzzle Mode 💤") :
      data.mode === 2 ? chalk.red("2 — Hyper Beam Mode 💥") :
      chalk.yellow("3 — Tri-Circuit Mode ⚡");
    console.log(`${chalk.cyan(guildId)} → ${mode}`);
  } catch {
    console.log(chalk.red(`⚠️ Failed to read ${file}`));
  }
}
=======
// modesummary.js
import fs from "fs";
import path from "path";
import chalk from "chalk";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const guildDir = path.join(__dirname, "automod", "guilds");
if (!fs.existsSync(guildDir)) {
  console.log(chalk.red("❌ No /automod/guilds directory found."));
  process.exit(1);
}

console.log(chalk.yellow("⚙️ Alpha Dedenne Mode Summary\n"));

const files = fs.readdirSync(guildDir).filter(f => f.endsWith(".json"));
if (!files.length) {
  console.log(chalk.gray("No guild mode files found."));
  process.exit(0);
}

for (const file of files) {
  const guildId = file.replace(".json", "");
  try {
    const data = JSON.parse(fs.readFileSync(path.join(guildDir, file)));
    const mode =
      data.mode === 1 ? chalk.blue("1 — Nuzzle Mode 💤") :
      data.mode === 2 ? chalk.red("2 — Hyper Beam Mode 💥") :
      chalk.yellow("3 — Tri-Circuit Mode ⚡");
    console.log(`${chalk.cyan(guildId)} → ${mode}`);
  } catch {
    console.log(chalk.red(`⚠️ Failed to read ${file}`));
  }
}
>>>>>>> 2bfdcbbd4614ef21d8e2fc162767bfc26864fe85
