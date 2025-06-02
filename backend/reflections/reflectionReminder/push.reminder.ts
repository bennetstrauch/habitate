import webpush from 'web-push';
import { ReminderDetails } from './sheduler.reminder.cron';

webpush.setVapidDetails(
  'mailto:you@example.com',
  process.env.VAPID_PUBLIC!,
  process.env.VAPID_PRIVATE!
);

export async function sendPushReminder(reminderDetails: ReminderDetails) {
  if (!reminderDetails.pushSubscriptions || reminderDetails.pushSubscriptions.length === 0) return;

  for (const subscription of reminderDetails.pushSubscriptions) {
    console.log('Sending push reminder to Subscription: ', subscription);
    try {
      await webpush.sendNotification(
        subscription,
        JSON.stringify({
          title: '🌱 Time to reflect',
          body: 'Would you like to take a moment for yourSelf?',
          icon: '/assets/icons/icon-192x192.png',
        })
      );
    } catch (error) {
      console.error('Failed to send push notification to', subscription.endpoint, error);
    }
  }
}