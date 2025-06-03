import fs from "fs";
import path from "path";
import { transporter } from "../../utils/emailTransporter";
import {
  appNameForSendingEmails,
  getRandomPhrase,
  logoAttachmentForEmail,
} from "../../utils/functionsAndVariables";
import { ReminderDetails } from "./sheduler.reminder.cron";

// 👇 Path to the logo image file
const logoPath = path.join(
  __dirname,
  "../../../global/assets/habitatelogo_64.png"
);

export async function sendEmailReminder(reminderDetails: ReminderDetails) {
  console.log("Sending email reminder to:", reminderDetails.email);

  const welcome = constructWelcomePhrase(reminderDetails.username);

  const html = `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 0px;">
        <img src="cid:habitateLogo" alt="MyHabitate Logo" style="width: 80px; height: auto;" />
      </div>
      <p style="font-size: 16px; text-align: center;">${welcome}</p>
      <p style="font-size: 16px; text-align: center;">Would you like to take a moment for yourSelf?</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://myhabitate.com"
           style="
             background-color:rgb(0, 166, 255);
             color: white;
             padding: 12px 24px;
             text-decoration: none;
             border-radius: 25px;
             font-weight: bold;
             box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
             transition: background-color 0.3s ease;">
          Click here to Reflect with Us
        </a>
      </div>
      <p style="font-size: 14px; color: #777; text-align: center;">
        From your friends at <strong>MyHabitate</strong> ❤️
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: appNameForSendingEmails,
    to: reminderDetails.email,
    subject: "Would you like to reflect with us today?",
    html,
    attachments: [logoAttachmentForEmail],
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

export const constructWelcomePhrase = (userName: string) => {
  const salutation = getRandomPhrase([
    "my friend.",
    "dear " + userName + ".",
    "beautiful soul.",
  ]);

  return greeting() + salutation;
};
