// =======================================================
//  ⚡ Alpha Dedenne v2.8 "Lumiose Security Core Hybrid Build"
//  Circuits synced — simulation and live defenses armed!
// =======================================================

import fs from "fs";
import "dotenv/config";
import winston from "winston";
import chalk from "chalk";
import {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
  PermissionsBitField
} from "discord.js";
import { handleAutoModCommand } from "./automod/commands.js";
import { handleMember } from "./guardian.js";

// ================= CONFIG ==================
const BOT_TOKEN = process.env.BOT_TOKEN;
const LOG_LEVEL = process.env.LOG_LEVEL || "info";
const OWNER_IDS = [process.env.OWNER_ID, "1097729364042457171"];
const STRIKE_THRESHOLD = Number(process.env.STRIKE_THRESHOLD || 3);

const isOwner = (id) => OWNER_IDS.includes(id);

// ================= LOGGER ==================
const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(
      ({ timestamp, level, message }) =>
        `${timestamp} [${level.toUpperCase()}] ${message}`
    )
  ),
  transports: [new winston.transports.Console()]
});

// =============== FILE SETUP =================
const bansFile = "./bans.json";
const strikesFile = "./strikes.json";
const guildLogFile = "./guild_logs.json";
for (const f of [bansFile, strikesFile, guildLogFile])
  if (!fs.existsSync(f)) fs.writeFileSync(f, "{}");

let bans = JSON.parse(fs.readFileSync(bansFile));
let strikes = JSON.parse(fs.readFileSync(strikesFile));
let guildLogs = JSON.parse(fs.readFileSync(guildLogFile));

const saveBans = () => fs.writeFileSync(bansFile, JSON.stringify(bans, null, 2));
const saveStrikes = () =>
  fs.writeFileSync(strikesFile, JSON.stringify(strikes, null, 2));
const saveGuildLogs = () =>
  fs.writeFileSync(guildLogFile, JSON.stringify(guildLogs, null, 2));

// =============== CLIENT =====================
let currentMode = 1; // 1=Nuzzle, 2=HyperBeam (Sim), 3=Tri-Circuit (Real)
const modeLabel = () =>
  currentMode === 1
    ? "Nuzzle Mode 💤"
    : currentMode === 2
    ? "Hyper Beam Mode 💥 (Simulation)"
    : "Tri-Circuit Mode ⚡ (Live)";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [Partials.Channel, Partials.Message, Partials.Reaction, Partials.User]
});

// =============== HELPERS ====================
async function ensureLogChannel(guild) {
  if (!guild) return null;
  try {
    const existingId = guildLogs[guild.id];
    const cached = existingId && guild.channels.cache.get(existingId);
    if (cached) return cached;
    let channel = guild.channels.cache.find(
      (c) => c.name === "lumiose-security-log" && c.type === 0
    );
    if (!channel) {
      channel = await guild.channels.create({
        name: "lumiose-security-log",
        type: 0,
        reason: "Auto-created by Alpha Dedenne for security logs"
      });
      console.log(chalk.green(`✅ Created #lumiose-security-log in ${guild.name}`));
    }
    guildLogs[guild.id] = channel.id;
    saveGuildLogs();
    return channel;
  } catch (err) {
    console.error(chalk.red(`❌ Failed to ensure log channel in ${guild?.name}: ${err.message}`));
    return null;
  }
}

// =============== STARTUP ====================
client.once("clientReady", async () => {
  console.log(
    chalk.yellow(`
╔══════════════════════════════════════════════════╗
║ ⚡ Alpha Dedenne v2.8 "Lumiose Security Core Hybrid Build" ║
║ ⚡ Circuits synced — simulation and live defenses armed!   ║
╚══════════════════════════════════════════════════╝
`)
  );
  logger.info(`✅ Alpha Dedenne online as ${client.user.tag}`);
  for (const [, g] of client.guilds.cache) await ensureLogChannel(g);
});

// =============== STRIKE HANDLER =============
async function recordStrike(user, guild, reason, simulated = false) {
  if (!strikes[user.id])
    strikes[user.id] = { tag: user.tag, attempts: 0, reasons: [] };
  strikes[user.id].attempts++;
  strikes[user.id].reasons.push({ reason, time: new Date().toISOString() });
  saveStrikes();

  const strikeCount = strikes[user.id].attempts;
  const embed = new EmbedBuilder()
    .setColor(simulated ? "#ffaa00" : "#ff0000")
    .setTitle(simulated ? "⚡ Simulated Strike" : "⚡ Unauthorized Signal Detected!")
    .setDescription(
      `**User:** ${user.tag}\n**ID:** ${user.id}\n**Reason:** ${reason}\n**Strikes:** ${strikeCount}`
    )
    .setFooter({ text: "Alpha Dedenne • Security Division" })
    .setTimestamp();

  const log = guild && (guild.channels.cache.get(guildLogs[guild.id]) || await ensureLogChannel(guild));
  if (log) await log.send({ embeds: [embed] }).catch(() => {});
  logger.warn(`[STRIKE] ${user.tag} (${user.id}) — ${reason} [${simulated ? "SIM" : "REAL"}]`);
  return strikeCount;
}

// =============== COMMAND HANDLER ============
client.on("messageCreate", async (msg) => {
  if (msg.author.bot || !msg.content.startsWith("~")) return;
  const [cmd, ...args] = msg.content.slice(1).split(" ");
  const guild = msg.guild;
  console.log(chalk.magenta(`[Command] ${msg.content} by ${msg.author.tag}`));

  // --- AutoMod passthrough ---
  if (cmd === "automod") {
    if (!isOwner(msg.author.id))
      return msg.reply("🔒 Only handlers can modify AutoMod.");
    return handleAutoModCommand(msg, client, logger);
  }

  // === Owner only ===
  if (!isOwner(msg.author.id)) {
    await recordStrike(msg.author, guild, `Unauthorized use of ~${cmd}`, currentMode !== 3);
    return msg.reply("⚠️ Unauthorized command detected!");
  }

  // === COMMAND SWITCH ===
  switch (cmd.toLowerCase()) {
    // ---- STATUS ----
    case "status": {
      const embed = new EmbedBuilder()
        .setColor("#00ffff")
        .setTitle("🔋 Alpha Dedenne Status")
        .setDescription(`**Current Mode:** ${modeLabel()}`)
        .setFooter({ text: "Lumiose Security Core" })
        .setTimestamp();
      msg.reply({ embeds: [embed] });
      break;
    }

    // ---- SETMODE ----
    case "setmode": {
      const num = parseInt(args[0]);
      if (![1, 2, 3].includes(num)) return msg.reply("Usage: `~setmode 1|2|3`");
      currentMode = num;
      console.log(chalk.cyan(`[MODE] Switched to ${modeLabel()}`));
      msg.channel.send(
        `⚡ Alpha Dedenne: “Oh boy… you *really* want me to go ${modeLabel()}? Once I’m charged, I won’t hold back!” 💥`
      );
      break;
    }

    // ---- STRIKE ----
    case "strike": {
      const userId = args[0];
      if (!userId) return msg.reply("Usage: `~strike <userId> <reason>`");
      const reason = args.slice(1).join(" ") || "No reason provided";
      const user = await client.users.fetch(userId).catch(() => null);
      if (!user) return msg.reply("User not found.");

      const simulated = currentMode !== 3;
      const count = await recordStrike(user, guild, reason, simulated);

      if (currentMode === 3 && count >= STRIKE_THRESHOLD) {
        await guild.members.ban(userId, { reason }).catch(() => {});
        msg.reply(`🚫 ${user.tag} has been banned (strike threshold reached).`);
      } else {
        msg.reply(
          simulated
            ? `⚡ Simulated strike logged for ${user.tag}.`
            : `⚡ Strike recorded for ${user.tag}.`
        );
      }
      break;
    }

    // ---- BAN ----
    case "ban": {
      const userId = args[0];
      if (!userId) return msg.reply("Usage: `~ban <userId> [reason]`");
      const reason = args.slice(1).join(" ") || "No reason given";
      const simulated = currentMode !== 3;
      const user = await client.users.fetch(userId).catch(() => null);
      if (!user) return msg.reply("User not found.");

      bans[userId] = { tag: user.tag, reason, time: new Date().toISOString() };
      saveBans();

      if (currentMode === 3) {
        await guild.members.ban(userId, { reason }).catch(() => {});
      }
      msg.reply(
        simulated
          ? `💥 Simulated ban for ${user.tag} logged.`
          : `🚫 ${user.tag} has been banned.`
      );
      logger.warn(`[BAN] ${user.tag} (${userId}) — ${reason} [${simulated ? "SIM" : "REAL"}]`);
      break;
    }

    // ---- UNBAN ----
    case "unban": {
      const userId = args[0];
      if (!userId) return msg.reply("Usage: `~unban <userId>`");
      const simulated = currentMode !== 3;
      if (bans[userId]) delete bans[userId];
      saveBans();

      if (currentMode === 3) {
        await guild.bans.remove(userId).catch(() => {});
      }
      msg.reply(
        simulated
          ? `🌀 Simulated unban for ${userId}.`
          : `✅ ${userId} has been unbanned.`
      );
      break;
    }

    // ---- SIMULATE ----
    case "simulate": {
      const type = args[0];
      const targetId = args[1];
      const user =
        (await client.users.fetch(targetId).catch(() => null)) || msg.author;
      const log =
        guild &&
        (guild.channels.cache.get(guildLogs[guild.id]) ||
          (await ensureLogChannel(guild)));
      const embed = new EmbedBuilder()
        .setColor("#ffaa00")
        .setTitle(`⚙️ Simulation: ${type}`)
        .setDescription(`Simulated ${type} event for <@${user.id}>`)
        .setFooter({ text: "Simulation Event" })
        .setTimestamp();
      if (log) await log.send({ embeds: [embed] }).catch(() => {});
      msg.channel.send({ embeds: [embed] });
      console.log(chalk.yellow(`[SIM] ${type} → ${user.tag}`));
      break;
    }

    // ---- MODE SUMMARY ----
    case "modesummary": {
      const guildDir = "./automod/guilds";
      if (!fs.existsSync(guildDir)) return msg.reply("No guild configs yet!");
      const files = fs.readdirSync(guildDir).filter((f) => f.endsWith(".json"));
      const lines = files
        .map((f) => {
          const gId = f.replace(".json", "");
          const data = JSON.parse(fs.readFileSync(`${guildDir}/${f}`));
          const mode =
            data.mode === 1
              ? "Nuzzle 💤"
              : data.mode === 2
              ? "Hyper Beam 💥"
              : "Tri-Circuit ⚡";
          return `**${gId}:** ${mode}`;
        })
        .join("\n");

      const embed = new EmbedBuilder()
        .setColor("#00ffff")
        .setTitle("⚙️ Alpha Dedenne Mode Summary")
        .setDescription(lines || "No guild files found.")
        .setFooter({ text: "DM Summary Report" })
        .setTimestamp();
      const owner = await client.users.fetch(process.env.OWNER_ID);
      owner.send({ embeds: [embed] }).catch(() => msg.reply("DM failed."));
      msg.reply("📬 Sent mode summary to your DMs.");
      break;
    }

    // ---- INFO ----
    case "info": {
      msg.reply(
        "⚡ **Alpha Dedenne v2.8 — Lumiose Security Core Hybrid Build**\n" +
          "Circuits synced — simulation and live defenses armed! ⚙️"
      );
      break;
    }

    default:
      msg.reply("Unknown command. Use `~status` to verify connection.");
  }
});

// =============== LOGIN ======================
client.login(BOT_TOKEN);

// =============== DASHBOARD ==================
import { spawn } from "child_process";
spawn("node", ["dashboard/server.js"], { stdio: "inherit" });
