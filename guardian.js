export async function handleMember(member, client, bans, currentMode, OWNER_ID, logger) {
  const id = member.user.id;
  if (!bans[id]?.active) return;
  logger.info(`[guardian] detected banned user ${member.user.tag} (${id})`);
  try {
    const owner = await client.users.fetch(OWNER_ID);
    await owner.send(`⚠️ Detected ${member.user.tag} (${id}) joining ${member.guild.name}.`);
  } catch (e) {
    logger.warn("Failed to DM owner: " + e.message);
  }
  if (currentMode === "hyper") {
    try {
      await member.ban({ reason: "Global ban match – Alpha Dedenne Hyper Beam Protocol" });
      logger.info("Auto-banned " + member.user.tag);
    } catch (e) {
      logger.error("Ban failed: " + e.message);
    }
  }
}
