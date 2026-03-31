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
exports.sendPasswordResetLink = exports.setNewPassword = void 0;
const error_class_1 = require("../utils/error.class");
const schemas_1 = require("../database/schemas");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const users_controller_1 = require("./users.controller");
const emailTransporter_1 = require("../utils/emailTransporter");
const functionsAndVariables_1 = require("../utils/functionsAndVariables");
const setNewPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token, newPassword } = req.body;
        if (!process.env.SECRET_KEY_FOR_SIGNING_TOKEN) {
            throw new Error("Secret key not found");
        }
        const payload = jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY_FOR_SIGNING_TOKEN);
        const user = yield schemas_1.UserModel.findById(payload._id);
        if (!user) {
            throw new error_class_1.ErrorWithStatus("User not found", 404);
        }
        user.password = yield (0, users_controller_1.hashPassword)(newPassword);
        yield user.save();
        const message = `Password updated successfully`;
        res.json({ success: true, data: message });
    }
    catch (err) {
        next(err);
    }
});
exports.setNewPassword = setNewPassword;
const sendPasswordResetLink = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        console.log("Sending password reset link to", email);
        // Find user by email
        const user = yield schemas_1.UserModel.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            throw new error_class_1.ErrorWithStatus("User not found", 404);
        }
        // Generate reset token (valid for 1 hour)
        if (!process.env.SECRET_KEY_FOR_SIGNING_TOKEN) {
            throw new error_class_1.ErrorWithStatus("Secret key not found", 500);
        }
        const resetToken = jsonwebtoken_1.default.sign({ _id: user._id }, process.env.SECRET_KEY_FOR_SIGNING_TOKEN, { expiresIn: "1h" });
        const resetLink = `http://myhabitate.com/set-new-password?token=${resetToken}`;
        yield emailTransporter_1.transporter.sendMail({
            from: functionsAndVariables_1.appNameForSendingEmails,
            to: user.email,
            subject: "Password Reset Request",
            // ## make look nicer
            text: `Hello ${user.name}. Please click the link to reset your password: ${resetLink}`,
        });
        const message = `We sent a Link to ${user.email}. Please check your inbox.`;
        res.json({ success: true, data: message });
    }
    catch (err) {
        next(err);
    }
});
exports.sendPasswordResetLink = sendPasswordResetLink;
