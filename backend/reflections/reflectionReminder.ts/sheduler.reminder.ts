import cron from 'node-cron';
import { DateTime } from 'luxon';
import { sendEmailReminder } from './email.reminder';
import { sendPushReminder } from './push.reminder';
import { UserModel } from '../../database/schemas';


cron.schedule('*/5 * * * *', async () => {
  const nowUTC = DateTime.utc();
  const users = UserModel.aggregate([
    {
        $match: {
            $or: [
                { "reflectionDetails.enableEmail": true },
                { "reflectionDetails.enablePush": true }
              ]
        },
        $project: {
            _id: 1,
            timezone: 1,
            reflectionReminderTime: "$reflectionDetails.reflectionReminderTime",
            allowEmail: "$reflectionDetails.enableEmail",
            allowPush: "$reflectionDetails.enablePush",
            
        },
    }

  for (const user of users) {
    const localTime = nowUTC.setZone(user.timezone);
    const [hour, minute] = user.reminderTime.split(':').map(Number);
    const targetTime = localTime.set({ hour, minute });

    if (
      localTime > targetTime &&
      !(await getReflectionForToday(user._id)) &&
      !(await checkIfReminderSent(user._id))
    ) {
      if (user.allowEmail) await sendEmailReminder(user);
      if (user.allowPush) await sendPushReminder(user);

      await markReminderSent(user._id); // Avoid duplicate sends
    }
  }
});
