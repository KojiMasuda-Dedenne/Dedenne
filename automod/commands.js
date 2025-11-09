import fs from "fs";
import path from "path";

export async function handleAutoModCommand(msg, client, logger) {
  const [_, subcmd, ...args] = msg.content.trim().split(/\s+/);
  const guildId = msg.guild?.id;
  if (!guildId) return;

  const guildPath = path.join("./automod/guilds", `${guildId}.json`);
  const defaultPath = path.join("./automod/defaults.json");

  const defaults = JSON.parse(fs.readFileSync(defaultPath));
  const guildCfg = fs.existsSync(guildPath)
    ? JSON.parse(fs.readFileSync(guildPath))
    : {};
  const config = { ...defaults, ...guildCfg };

  function saveConfig() {
    fs.writeFileSync(guildPath, JSON.stringify(config, null, 2));
  }

  switch ((subcmd || "").toLowerCase()) {
    case "status": {
      const filters = Object.keys(config.filters)
        .map(f => `• ${f}: ${JSON.stringify(config.filters[f])}`)
        .join("\n");
      const actions = Object.keys(config.actions)
        .map(a => `• ${a}: ${config.actions[a]}`)
        .join("\n");
      msg.reply(
        `⚙️ **AutoMod Status for ${msg.guild.name}**\n\n` +
          `📋 **Filters:**\n${filters}\n\n` +
          `🧠 **Actions:**\n${actions}\n\n` +
          `🪩 **Log Channel:** <#${config.logChannel || "Not set"}>`
      );
      break;
    }

    case "reload": {
      msg.reply("🔄 Reloaded AutoMod configuration for this guild.");
      logger.info(`[AutoMod] Reloaded config for ${guildId}`);
      break;
    }

    case "set": {
      const [filter, operation, ...rest] = args;
      if (!filter || !operation)
        return msg.reply("Usage: `~automod set <filter> add/remove <value>`");

      const value = rest.join(" ").trim();
      if (!config.filters[filter])
        config.filters[filter] = Array.isArray(value) ? [] : "";

      if (operation === "add") {
        if (Array.isArray(config.filters[filter])) {
          config.filters[filter].push(value);
          msg.reply(`✅ Added "${value}" to ${filter}`);
        } else {
          msg.reply(`⚠️ ${filter} isn’t a list-based filter.`);
        }
      } else if (operation === "remove") {
        if (Array.isArray(config.filters[filter])) {
          config.filters[filter] = config.filters[filter].filter(v => v !== value);
          msg.reply(`🗑️ Removed "${value}" from ${filter}`);
        } else {
          msg.reply(`⚠️ ${filter} isn’t a list-based filter.`);
        }
      } else {
        msg.reply("Usage: `~automod set <filter> add/remove <value>`");
      }

      saveConfig();
      break;
    }

    case "toggle": {
      const [action, state] = args;
      if (!action || !["on", "off"].includes(state))
        return msg.reply("Usage: `~automod toggle <action> on/off`");

      if (config.actions[action] === undefined)
        return msg.reply(`⚠️ Unknown action: ${action}`);

      config.actions[action] = state === "on";
      saveConfig();
      msg.reply(`✅ Set ${action} = ${state.toUpperCase()}`);
      break;
    }

    case "channel": {
      const channel = msg.mentions.channels.first();
      if (!channel)
        return msg.reply("Usage: `~automod channel #channel`");
      config.logChannel = channel.id;
      saveConfig();
      msg.reply(`📡 Log channel updated to ${channel}`);
      break;
    }

    case "export": {
      const exportPath = `./automod_export_${guildId}.json`;
      fs.writeFileSync(exportPath, JSON.stringify(config, null, 2));
      await msg.reply({
        content: `📦 Exported AutoMod config for **${msg.guild.name}**`,
        files: [exportPath]
      });
      logger.info(`[AutoMod] Exported config for ${guildId}`);
      break;
    }

    default:
      msg.reply(
        "⚙️ **AutoMod Configuration Commands**\n\n" +
          "`~automod status` – View current settings\n" +
          "`~automod reload` – Reload config file\n" +
          "`~automod set <filter> add/remove <value>` – Edit filters\n" +
          "`~automod toggle <action> on/off` – Enable or disable actions\n" +
          "`~automod channel #channel` – Set log channel\n" +
          "`~automod export` – Export current configuration"
      );
  }
}
