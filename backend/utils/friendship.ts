import { UserModel } from "../database/schemas";
import { ErrorWithStatus } from "./error.class";

export const requireFriendship = async (
  userId: string | undefined,
  friendId: string
): Promise<string> => {
  if (!userId) throw new ErrorWithStatus("Unauthorized", 401);

  const user = await UserModel.findById(userId, "connections");

  const isConnected = user?.connections?.some(
    (id: any) => id.toString() === friendId
  );

  if (!isConnected) {
    throw new ErrorWithStatus("Not connected to this user", 403);
  }

  return friendId;
};
