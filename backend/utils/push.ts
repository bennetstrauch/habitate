import webpush from 'web-push';
import { UserModel } from '../database/schemas';
import { idToObjectId } from './functionsAndVariables';

webpush.setVapidDetails(
  'mailto:you@example.com',
  process.env.VAPID_PUBLIC!,
  process.env.VAPID_PRIVATE!
);

export async function sendPushToUser(userId: string, title: string, body: string, url = '/goals') {
  const user = await UserModel.findById(idToObjectId(userId), 'reflectionDetails');
  if (!user?.reflectionDetails?.enablePush) return;

  const subscriptions = user.reflectionDetails.pushSubscriptions ?? [];
  if (subscriptions.length === 0) return;

  const expiredEndpoints: string[] = [];

  for (const subscription of subscriptions) {
    try {
      await webpush.sendNotification(
        subscription,
        JSON.stringify({ title, body, icon: '/assets/icons/icon-192x192.png', url })
      );
    } catch (error: any) {
      if (error.statusCode === 404 || error.statusCode === 410) {
        expiredEndpoints.push(subscription.endpoint!);
      } else {
        console.error('Push failed for', subscription.endpoint, error);
      }
    }
  }

  if (expiredEndpoints.length > 0) {
    await UserModel.updateOne(
      { _id: idToObjectId(userId) },
      { $pull: { 'reflectionDetails.pushSubscriptions': { endpoint: { $in: expiredEndpoints } } } }
    );
  }
}
