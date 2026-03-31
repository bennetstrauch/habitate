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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.constructWelcomePhrase = void 0;
exports.sendEmailReminder = sendEmailReminder;
const path_1 = __importDefault(require("path"));
const emailTransporter_1 = require("../../utils/emailTransporter");
const functionsAndVariables_1 = require("../../utils/functionsAndVariables");
// 👇 Path to the logo image file
const logoPath = path_1.default.join(__dirname, "../../../global/assets/habitatelogo_64.png");
function sendEmailReminder(reminderDetails) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Sending email reminder to:", reminderDetails.email);
        const welcome = (0, exports.constructWelcomePhrase)(reminderDetails.username);
        const html = `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 0px;">
        <img src="cid:habitateLogo" alt="MyHabitate Logo" style="width: 80px; height: auto;" />
      </div>
      <p style="font-size: 16px; text-align: center;">${welcome}</p>
      <p style="font-size: 16px; text-align: center;">Would you like to take a moment for your Self?</p>
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
        yield emailTransporter_1.transporter.sendMail({
            from: functionsAndVariables_1.appNameForSendingEmails,
            to: reminderDetails.email,
            subject: "Would you like to reflect with us today?",
            html,
            attachments: [functionsAndVariables_1.logoAttachmentForEmail],
        });
    });
}
const getTimeOfDayGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12)
        return "morning";
    if (hour < 18)
        return "afternoon";
    return "evening";
};
const greeting = () => (0, functionsAndVariables_1.getRandomPhrase)([
    "Hello ",
    "Welcome ",
    "Good " + getTimeOfDayGreeting() + " ",
    "Good to see you ",
]);
const constructWelcomePhrase = (userName) => {
    const salutation = (0, functionsAndVariables_1.getRandomPhrase)([
        "my friend.",
        "dear " + userName + ".",
        "beautiful soul.",
    ]);
    return greeting() + salutation;
};
exports.constructWelcomePhrase = constructWelcomePhrase;
