import { RequestHandler } from 'express';
import { StandardResponse } from '../types/standardResponse';
import { ErrorWithStatus } from '../utils/error.class';
import path from 'path';
import { constructWelcomePhrase } from '../reflections/reflectionReminder/email.reminder';
import { transporter } from "../utils/emailTransporter";
import { appNameForSendingEmails, logoAttachmentForEmail } from '../utils/functionsAndVariables';


type SendTestEmailReqHandler = RequestHandler<unknown, StandardResponse<string>, { email: string; username: string }, unknown>;

export const sendTestEmailController: SendTestEmailReqHandler = async (req, res, next) => {
  try {
    const { email, username } = req.body;

    if (!email || !username) {
      throw new ErrorWithStatus('Email and username are required', 400);
    }

    await sendTestEmail(email, username);

    

    res.status(200).json({ success: true, data: 'Test email sent' });
  } catch (err) {
    next(err);
  }
};



async function sendTestEmail(email: string, username: string) {
  console.log("Sending test email to:", email);

  const welcome = constructWelcomePhrase(username);

  const html = `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 0px;">
        <img src="cid:habitateLogo" alt="MyHabitate Logo" style="width: 80px; height: auto;" />
      </div>
      <p style="font-size: 16px; text-align: center;">${welcome}</p>
      <p style="font-size: 16px; text-align: center;">
        This is a test email to ensure you receive our reminders. 
        Please check your spam folder if you don't see this in your inbox and mark it as "not spam."
      </p>
      <p style="font-size: 14px; color: #777; text-align: center;">
        From your friends at <strong>MyHabitate</strong> ❤️
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: appNameForSendingEmails,
    to: email,
    subject: "Test Email from MyHabitate",
    html,
    attachments: [
        // change for emailreminder as well.
      logoAttachmentForEmail,
    ],
  });
}