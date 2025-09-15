// utils/telegram.ts
export async function sendTelegramMessage(text: string) {
  const token = process.env.TELEGRAM_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.error("❌ Telegram token ou chat ID manquant dans .env");
    return;
  }

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
        }),
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Telegram API error: ${errorText}`);
    }

    console.log("✅ Message envoyé sur Telegram !");
  } catch (error) {
    console.error("❌ Erreur envoi Telegram:", error);
  }
}

/**
 * Exemple de fonction wrapper pour envoyer une notif formatée
 */
export async function sendTelegramNotification(
  type: "booking" | "cancel",
  data: any
) {
  let message = "";

  switch (type) {
    case "booking":
      message = `📌 Nouvelle réservation !\n\nNom: ${data.name}\nDate arrivée: ${data.arrival}\nDate départ: ${data.departure}`;
      break;
    case "cancel":
      message = `⚠️ Réservation annulée pour ${data.name}`;
      break;
    default:
      message = "ℹ️ Notification générique";
  }

  await sendTelegramMessage(message);
}
