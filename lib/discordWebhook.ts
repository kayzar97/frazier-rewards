export async function sendDiscordLog(message: string) {
  try {
    await fetch(process.env.DISCORD_WEBHOOK_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: message,
      }),
    });
  } catch (err) {
    console.error("Discord webhook failed:", err);
  }
}