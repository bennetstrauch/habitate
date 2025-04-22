import { RequestHandler } from "express";
import { ErrorWithStatus } from "../utils/error.class";
import { UserModel } from "../database/schemas";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { StandardResponse } from "../types/standardResponse";
import { hashPassword } from "./users.controller";
import { transporter } from "../utils/emailTransporter";
import { appNameForSendingEmails } from "../utils/functionsAndVariables";



export const setNewPassword: RequestHandler<unknown, StandardResponse<string>, {token: string, newPassword: string}> = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!process.env.SECRET_KEY_FOR_SIGNING_TOKEN) {
      throw new Error("Secret key not found");
    }

    const payload = jwt.verify(token, process.env.SECRET_KEY_FOR_SIGNING_TOKEN) as { _id: string };

    const user = await UserModel.findById(payload._id);

    if (!user) {
      throw new ErrorWithStatus("User not found", 404);
    }

    user.password = await hashPassword(newPassword);
    await user.save();

    const message = `Password updated successfully`;

    res.json({ success: true, data: message });
  } catch (err) {
    next(err);
  }
}

export const sendPasswordResetLink: RequestHandler<
  unknown,
  StandardResponse<string>,
  { email: string }
> = async (req, res, next) => {
  try {
    const { email } = req.body;

    console.log("Sending password reset link to", email);
    // Find user by email
    const user = await UserModel.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      throw new ErrorWithStatus("User not found", 404);
    }

    // Generate reset token (valid for 1 hour)
    if (!process.env.SECRET_KEY_FOR_SIGNING_TOKEN) {
      throw new ErrorWithStatus("Secret key not found", 500);
    }

    const resetToken = jwt.sign(
      { _id: user._id },
      process.env.SECRET_KEY_FOR_SIGNING_TOKEN,
      { expiresIn: "1h" }
    );


    const resetLink = `http://myhabitate.com/set-new-password?token=${resetToken}`;

    await transporter.sendMail({
      from: appNameForSendingEmails,
      to: user.email,
      subject: "Password Reset Request",
      // ## make look nicer
      text: `Hello ${user.name}. Please click the link to reset your password: ${resetLink}`,
    });

    const message = `We sent a Link to ${user.email}. Please check your inbox.`;

    res.json({ success: true, data: message });
  } catch (err) {
    next(err);
  }
};
