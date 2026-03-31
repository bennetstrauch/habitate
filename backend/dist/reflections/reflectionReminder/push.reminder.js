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
exports.sendPushReminder = sendPushReminder;
const web_push_1 = __importDefault(require("web-push"));
web_push_1.default.setVapidDetails('mailto:you@example.com', process.env.VAPID_PUBLIC, process.env.VAPID_PRIVATE);
function sendPushReminder(reminderDetails) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!reminderDetails.pushSubscriptions || reminderDetails.pushSubscriptions.length === 0)
            return;
        for (const subscription of reminderDetails.pushSubscriptions) {
            console.log('Sending push reminder to Subscription: ', subscription);
            try {
                yield web_push_1.default.sendNotification(subscription, JSON.stringify({
                    title: '🌱 Time to reflect',
                    body: 'Would you like to take a moment for yourSelf?',
                    icon: '/assets/icons/icon-192x192.png',
                }));
            }
            catch (error) {
                console.error('Failed to send push notification to', subscription.endpoint, error);
            }
        }
    });
}
