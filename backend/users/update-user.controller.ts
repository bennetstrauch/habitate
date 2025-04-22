import { RequestHandler } from "express";
import { UserModel } from "../database/schemas";
import { StandardResponse } from "../types/standardResponse";
import { ErrorWithStatus } from "../utils/error.class";
import { capitalizeFirstLetter } from "../utils/functionsAndVariables";
import { hashPassword } from "./users.controller";
import { User } from "./users.types";

type GetUserDetailsReqHandler = RequestHandler<
  unknown,
  StandardResponse<User>,
  unknown,
  unknown
>;

export const getUserDetails: GetUserDetailsReqHandler = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.userId

    if (!userId) {
      throw new ErrorWithStatus("Unauthorized", 401);
    }

    const user = await UserModel.findById(userId).select("-password");
    if (!user) {
      throw new ErrorWithStatus("User not found", 404);
    }

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

type UpdateUserReqHandler = RequestHandler<
  unknown,
  StandardResponse<string>,
  Partial<User>,
  unknown
>;

export const updateUser: UpdateUserReqHandler = async (req, res, next) => {
  try {
    const userId = req.userId;
    const updates = req.body;

    if (!userId) {
      throw new ErrorWithStatus("Unauthorized", 401);
    }

    // Capitalize name if provided
    if (updates.name) {
      updates.name = capitalizeFirstLetter(updates.name.trim());
    }

    // Hash password if provided
    if (updates.password) {
      updates.password = await hashPassword(updates.password);
    }

    // Update user
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true }
    );
    if (!updatedUser) {
      throw new ErrorWithStatus("User not found", 404);
    }

    res.status(200).json({ success: true, data: updatedUser._id.toString() });
  } catch (err) {
    next(err);
  }
};
