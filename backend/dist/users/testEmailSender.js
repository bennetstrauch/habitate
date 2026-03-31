"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTestEmailController = void 0;
const error_class_1 = require("../utils/error.class");
const email_reminder_1 = require("../reflections/reflectionReminder/email.reminder");
const emailTransporter_1 = require("../utils/emailTransporter");
const functionsAndVariables_1 = require("../utils/functionsAndVariables");
const sendTestEmailController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, username } = req.body;
        if (!email || !username) {
            throw new error_class_1.ErrorWithStatus("Email and username are required", 400);
        }
        yield sendTestEmail(email, username);
        res.status(200).json({ success: true, data: "Test email sent" });
    }
    catch (err) {
        next(err);
    }
});
exports.sendTestEmailController = sendTestEmailController;
function sendTestEmail(email, username) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Sending test email to:", email);
        const welcome = (0, email_reminder_1.constructWelcomePhrase)(username);
        const html = `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 0px;">
        <img src="cid:habitateLogo" alt="MyHabitate Logo" style="width: 80px; height: auto;" />
      </div>
      <p style="font-size: 16px; text-align: center;">${welcome}</p>
      <p style="font-size: 16px; text-align: center;">
        This is a test email to ensure you receive our gentle reminders. 
        If this email landed in your spam-folder, please mark it as "not spam."
      </p>
      <p style="font-size: 14px; color: #777; text-align: center;">
        From your friends at <strong>MyHabitate</strong> ❤️
      </p>
    </div>
  `;
        yield emailTransporter_1.transporter.sendMail({
            from: functionsAndVariables_1.appNameForSendingEmails,
            to: email,
            subject: "Test Email from MyHabitate",
            html,
            attachments: [
                // change for emailreminder as well.
                functionsAndVariables_1.logoAttachmentForEmail,
            ],
        });
    });
}
