import { RequestHandler } from "express";
import { UserModel } from "../database/schemas";
import { StandardResponse } from "../types/standardResponse";
import { ErrorWithStatus } from "../utils/error.class";

const MAX_UPLIFTERS = 5;

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no confusable chars (0/O, 1/I)
  return Array.from(
    { length: 6 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

async function generateUniqueCode(): Promise<string> {
  let code: string;
  let exists: boolean;
  do {
    code = generateInviteCode();
    exists = !!(await UserModel.findOne({ inviteCode: code }, "_id"));
  } while (exists);
  return code;
}

export const getInviteCode: RequestHandler = async (req, res, next) => {
  try {
    let user = await UserModel.findById(req.userId, "inviteCode");
    if (!user) throw new ErrorWithStatus("User not found", 404);

    if (!user.inviteCode) {
      const code = await generateUniqueCode();
      user = await UserModel.findByIdAndUpdate(
        req.userId,
        { inviteCode: code },
        { new: true, select: "inviteCode" }
      );
    }

    res.json({ success: true, data: { inviteCode: user!.inviteCode } });
  } catch (err) {
    next(err);
  }
};

export const regenerateInviteCode: RequestHandler = async (req, res, next) => {
  try {
    const code = await generateUniqueCode();
    await UserModel.updateOne({ _id: req.userId }, { inviteCode: code });
    res.json({ success: true, data: { inviteCode: code } });
  } catch (err) {
    next(err);
  }
};

export const getConnections: RequestHandler = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.userId, "connections").populate(
      "connections",
      "name _id"
    );
    if (!user) throw new ErrorWithStatus("User not found", 404);

    res.json({ success: true, data: user.connections ?? [] });
  } catch (err) {
    next(err);
  }
};

export const connect: RequestHandler<
  unknown,
  StandardResponse<{ _id: string; name: string }>,
  { code: string }
> = async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code) throw new ErrorWithStatus("Invite code required", 400);

    const friend = await UserModel.findOne(
      { inviteCode: code.trim().toUpperCase() },
      "_id name connections"
    );
    if (!friend) throw new ErrorWithStatus("No user found with that code", 404);

    if (friend._id.toString() === req.userId) {
      throw new ErrorWithStatus("You cannot add yourself", 400);
    }

    const me = await UserModel.findById(req.userId, "connections");
    if (!me) throw new ErrorWithStatus("User not found", 404);

    const myConnections = (me.connections ?? []) as any[];

    if (myConnections.some((id: any) => id.toString() === friend._id.toString())) {
      throw new ErrorWithStatus("Already connected", 400);
    }

    if (myConnections.length >= MAX_UPLIFTERS) {
      throw new ErrorWithStatus(
        `You can have at most ${MAX_UPLIFTERS} Uplifters`,
        400
      );
    }

    const friendConnections = (friend.connections ?? []) as any[];
    if (friendConnections.length >= MAX_UPLIFTERS) {
      throw new ErrorWithStatus(
        "This person already has the maximum number of Uplifters",
        400
      );
    }

    await UserModel.updateOne(
      { _id: req.userId },
      { $addToSet: { connections: friend._id } }
    );
    await UserModel.updateOne(
      { _id: friend._id },
      { $addToSet: { connections: req.userId } }
    );

    res.json({
      success: true,
      data: { _id: friend._id.toString(), name: friend.name },
    });
  } catch (err) {
    next(err);
  }
};

export const removeConnection: RequestHandler<
  { friendId: string },
  StandardResponse<null>
> = async (req, res, next) => {
  try {
    const { friendId } = req.params;

    await UserModel.updateOne(
      { _id: req.userId },
      { $pull: { connections: friendId } }
    );
    await UserModel.updateOne(
      { _id: friendId },
      { $pull: { connections: req.userId } }
    );

    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
};
