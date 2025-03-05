import { RequestHandler } from "express";
import { TokenExpiredError, verify } from "jsonwebtoken";
import { Token } from "../types/token";
import { ErrorWithStatus } from "../utils/error.class";

export const checkToken: RequestHandler = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader) throw new ErrorWithStatus("No Token Found", 401);

    const token = (authHeader as string).split(" ")[1];

    if (!process.env.SECRET_KEY_FOR_SIGNING_TOKEN)
      throw new ErrorWithStatus("Secret not found", 401);

    // const payload = verify(token, process.env.SECRET_KEY_FOR_SIGNING_TOKEN);
    const payload = verify(
      token,
      process.env.SECRET_KEY_FOR_SIGNING_TOKEN
    ) as Token;
    req.userId = payload._id;

    console.log("payload", payload);
    next();
  } catch (e) {
    if (e instanceof TokenExpiredError) {
      console.log("Token Expired");
      next(new ErrorWithStatus("Token Expired", 401));
    } else {
      next(e);
    }
  }
};
