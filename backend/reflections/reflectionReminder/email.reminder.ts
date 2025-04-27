import nodemailer from "nodemailer";
import { transporter } from "../../utils/emailTransporter";
import {
  appNameForSendingEmails,
  getRandomPhrase,
} from "../../utils/functionsAndVariables";
import { User } from "../../users/users.types";
import { ReminderDetails } from "./sheduler.reminder.cron";

export async function sendEmailReminder(reminderDetails: ReminderDetails) {
  console.log("Sending email reminder to: ", reminderDetails.email);
  const text = `${constructWelcomePhrase(
    reminderDetails.username
  )} Would you like to take a moment for yourSelf?`;

  await transporter.sendMail({
    from: appNameForSendingEmails,
    to: reminderDetails.email,
    subject: "Would you like to reflect with us today?",
    // text: `${constructWelcomePhrase(reminderDetails.username)} Would you like to take a moment for yourSelf?`,
    html: `<p>${text}<br><a>myhabitate.com</a></p>`,
  });
}

const getTimeOfDayGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
};

const greeting = () =>
  getRandomPhrase([
    "Hello ",
    "Welcome ",
    "Good " + getTimeOfDayGreeting() + " ",
    "Good to see you ",
  ]);

const constructWelcomePhrase = (userName: string) => {
  const salutation = getRandomPhrase([
    "my friend.",
    "dear " + userName + ".",
    "beautiful soul.",
  ]);

  const welcomePhrase = greeting() + salutation;
  return welcomePhrase;
};
