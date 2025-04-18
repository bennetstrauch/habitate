import { RequestHandler } from "express";
import { UserModel } from "../database/schemas";
import { StandardResponse } from "../types/standardResponse";
import { ErrorWithStatus } from "../utils/error.class";

// GET /api/user/tour-status
export const getTourCompletedStatus : RequestHandler<unknown, StandardResponse<boolean>> = async (req, res) => {
    const user = await UserModel.findById(req.userId).select('tourCompleted');

    if (!user) {
          throw new ErrorWithStatus("User not found", 401);
        }

        if (user.tourCompleted === undefined) {
          res.json({ success: false, data: true});
        }
// #change to return data: {tourCompleted: user.tourCompleted}  
    res.json({ success: true, data: user.tourCompleted});
  };
  
  // PATCH /api/user/tour-complete
  export const setTourCompleteStatusTrue : RequestHandler<unknown, StandardResponse<boolean>> =  async (req, res) => {
    const user = await UserModel.updateOne(
        { _id: req.userId },
        { tourCompleted: true }
    )
    if (!user) {
        throw new ErrorWithStatus("User not found", 401);
      }

    res.json({ success: true, data: true });
  };