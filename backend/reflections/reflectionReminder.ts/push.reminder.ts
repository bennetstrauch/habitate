import webpush from 'web-push';
import { User } from '../../users/users.types';

webpush.setVapidDetails(
  'mailto:you@example.com',
  process.env.VAPID_PUBLIC!,
  process.env.VAPID_PRIVATE!
);

export async function sendPushReminder(user: User) {
  if (!user.pushSubscription) return;

  await webpush.sendNotification(user.pushSubscription, JSON.stringify({
    title: '🌱 Time to reflect',
    body: 'Would you like to take a moment for yourSelf?',
    // #unify with email and diversivy message
    icon: '/assets/icons/icon-192x192.png'
  }));
}
