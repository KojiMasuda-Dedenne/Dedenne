import "dotenv/config";
import { REST, Routes } from "discord.js";

const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);
const commands = [{ name: "status", description: "Show Alpha Dedenne status" }];

(async () => {
  try {
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log("✅ Slash command registered.");
  } catch (e) {
    console.error(e);
  }
})();
