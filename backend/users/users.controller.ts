import { RequestHandler } from "express";
import { ErrorWithStatus } from "../utils/classes";
import { User } from "./users.model";
import { StandardResponse } from "../types/standardResponse";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { LoginResponse } from "../types/login/loginResponse";
import { LoginRequest } from "../types/login/loginRequest";
import { UserModel } from "../database/schemas";

type RegisterReqHandler = RequestHandler<
  unknown,
  StandardResponse<string>,
  User,
  unknown
>;

export const register: RegisterReqHandler = async (req, res, next) => {
  try {
    const newUser = req.body;

    const hashedPassword = await bcrypt.hash(newUser.password, 10);
    const newUserHashed = { ...req.body, password: hashedPassword };

    const savedUser = await UserModel.create(newUserHashed);
    const newUserId = savedUser._id.toString();

    res.status(201).json({ success: true, data: newUserId });

    console.log("User created successfully: ", savedUser);
  } catch (err) {
    next(err);
  }
};

type LoginReqHandler = RequestHandler<
  unknown,
  LoginResponse,
  LoginRequest,
  unknown
>;

export const login: LoginReqHandler = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Find user
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new ErrorWithStatus("Invalid email", 401);
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new ErrorWithStatus("Invalid password", 401);
    }

    // Generate token
    if (!process.env.SECRET_KEY_FOR_SIGNING_TOKEN) {
      throw new ErrorWithStatus("Secret not found", 401);
    }

    const token = jwt.sign(
      { _id: user._id, name: user.name, email: user.email },
      process.env.SECRET_KEY_FOR_SIGNING_TOKEN,
      {
        expiresIn: "1h",
      }
    );

    // Send token
    res.status(200).json({ success: true, data: { token } });
  } catch (err) {
    next(err);
  }
};
