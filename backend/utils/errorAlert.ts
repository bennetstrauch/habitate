import { transporter } from "./emailTransporter";
import { appNameForSendingEmails } from "./functionsAndVariables";

const ADMIN_EMAIL = "bennetstrauch@googlemail.com";

export async function sendErrorAlert(context: string, err: unknown): Promise<void> {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`[CRITICAL] ${context}:`, err);

  try {
    await transporter.sendMail({
      from: appNameForSendingEmails,
      to: ADMIN_EMAIL,
      subject: `[Habitate] Critical backend error: ${context}`,
      text: `Context: ${context}\n\nError: ${message}\n\nTime: ${new Date().toISOString()}`,
    });
  } catch (mailErr) {
    console.error("[CRITICAL] Failed to send error alert email:", mailErr);
  }
}
