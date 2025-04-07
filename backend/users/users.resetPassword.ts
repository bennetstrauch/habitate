import { RequestHandler } from "express";
import { ErrorWithStatus } from "../utils/error.class";
import { UserModel } from "../database/schemas";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { StandardResponse } from "../types/standardResponse";

export const sendPasswordResetLink: RequestHandler<
  unknown,
  StandardResponse<string>,
  { email: string }
> = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await UserModel.findOne({ email: email.toLowerCase() });
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

    // Send reset email (configure nodemailer)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetLink = `http://localhost:4200/reset-password?token=${resetToken}`;

    await transporter.sendMail({
      from: `"Habitate" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Password Reset Request",
      text: `Helloooooo ${user.name}. Please click the link to reset your password: ${resetLink}`,
    });

    const message = `We sent a Link to ${user.email}. Please check your inbox.`;

    res.json({ success: true, data: message });
  } catch (err) {
    next(err);
  }
};
