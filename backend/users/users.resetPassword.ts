import { RequestHandler } from "express";
import { ErrorWithStatus } from "../utils/error.class";
import { UserModel } from "../database/schemas";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

export const forgotPassword: RequestHandler = async (req, res, next) => {
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
      from: `"Your App" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Password Reset Request",
      text: `Click the link to reset your password: ${resetLink}`,
    });

    res.json({ success: true, message: "Password reset email sent" });

  } catch (err) {
    next(err);
  }
};
