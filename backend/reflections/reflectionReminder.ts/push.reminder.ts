import webpush from "web-push";
import { User } from "../../users/users.types";
import { ReminderDetails } from "./sheduler.reminder.cron";

webpush.setVapidDetails(
  "mailto:you@example.com",
  process.env.VAPID_PUBLIC!,
  process.env.VAPID_PRIVATE!
);

export async function sendPushReminder(reminderDetails: ReminderDetails) {
  if (!reminderDetails.pushSubscription) return;

  await webpush.sendNotification(
    reminderDetails.pushSubscription,
    JSON.stringify({
      title: "🌱 Time to reflect",
      body: "Would you like to take a moment for yourSelf?",
      // #unify with email and diversivy message, #dont need to pass everything, need for ReminderDetails at all in parent?
      icon: "/assets/icons/icon-192x192.png",
    })
  );
}
