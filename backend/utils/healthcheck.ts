import { RequestHandler } from "express";
import { StandardResponse } from "../types/standardResponse";

export const healthCheck: RequestHandler<unknown, StandardResponse<string>> = (
  req,
  res
) => {
  res
    .status(200)
    .json({ success: true, data: "Server is running and super healthy ;)" });
};
