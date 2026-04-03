import { sendPushToUser } from '../../utils/push';
import { ReminderDetails } from './sheduler.reminder.cron';

export async function sendPushReminder(reminderDetails: ReminderDetails) {
  if (!reminderDetails.pushSubscriptions || reminderDetails.pushSubscriptions.length === 0) return;
  await sendPushToUser(
    reminderDetails.user_id.toString(),
    '🌱 Time to reflect',
    'Would you like to take a moment for yourSelf?'
  );
}
