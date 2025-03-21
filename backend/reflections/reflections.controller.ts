import { RequestHandler } from "express";
import { Reflection } from "./reflections.types";
import { StandardResponse } from "../types/standardResponse";
import {
  createAndSaveReflectionForDate,
  getNewReflectionForDate,
} from "./newReflection";
import { ErrorWithStatus } from "../utils/error.class";
import { ReflectionModel } from "../database/schemas";
import { getReflectionFromDBOrCreate } from "./reflection.database";
import { StatsBase } from "fs";
import { StatBase } from "../progresses/progress.types";
import { ObjectId } from "../types/ObjectId.type";
import {
  idToObjectId,
} from "../utils/functionsAndVariables";


type GetReflectionForDateReqHandler = RequestHandler<
  unknown,
  StandardResponse<Reflection | null>,
  unknown,
  { date: string }
>;

export const getReflectionForDate: GetReflectionForDateReqHandler = async (
  req,
  res,
  next
) => {
  try {
    const user_id = req.userId;
    const { date } = req.query;

    if (!user_id) {
      throw new ErrorWithStatus("Invalid userId", 401);
    }

    console.log('Getting reflection for date and userId', date, user_id);

    const reflection = await getReflectionFromDBOrCreate(
      user_id,
      new Date(date),
    );

    res.json({ success: true, data: reflection });
  } catch (err) {
    next(err);
  }
};

type GetReflectionReqHandler = RequestHandler<
  { reflection_id: string },
  StandardResponse<Reflection | null>
>;

export const getReflection: GetReflectionReqHandler = async (
  req,
  res,
  next
) => {
  try {
    const { reflection_id } = req.params;

    const progress = (await ReflectionModel.findOne(
      { reflection_id },
      { embedded_name: 0, __v: 0 }
    )) as Reflection | null;

    if (!progress) {
      throw new ErrorWithStatus("getReflectionError: Not found", 404);
    }

    res.json({ success: true, data: progress });
  } catch (err) {
    next(err);
  }
};

type CreateReflectionReqHandler = RequestHandler<
  unknown,
  StandardResponse<Reflection>,
  { date: string }
>;

export const createReflection: CreateReflectionReqHandler = async (
  req,
  res,
  next
) => {
  try {
    const user_id = req.userId;
    const { date } = req.body;

    if (!user_id) {
      throw new ErrorWithStatus("Invalid userId", 401);
    }

    const createdReflection = await createAndSaveReflectionForDate(
      user_id,
      new Date(date)
    );
    console.log("createdReflection", createdReflection);

    res.json({ success: true, data: createdReflection });
  } catch (err) {
    next(err);
  }
};

type PutReflectionReqHandler = RequestHandler<
  { reflection_id: string },
  StandardResponse<number>,
  Reflection
>;

export const putReflection: PutReflectionReqHandler = async (
  req,
  res,
  next
) => {
  try {
    const { reflection_id } = req.params;

    const result = await ReflectionModel.updateOne(
      { _id: reflection_id },
      { $set: req.body }
    );

    res.status(200).json({ success: true, data: result.modifiedCount });
  } catch (err) {
    next(err);
  }
};


type getReflectionStatsReqHandler = RequestHandler<
  unknown,
  StandardResponse<StatBase>,
  unknown,
  { startDate: Date; endDate: Date }
>;


export const getReflectionStats: getReflectionStatsReqHandler = async (
  req,
  res,
  next
) => {
  try {
    const user_id = req.userId;
    const { startDate, endDate } = req.query;

    if (!user_id) {
      throw new ErrorWithStatus("Invalid userId", 401);
    }

    console.log('Getting reflection stats for date range and userId', new Date(startDate), endDate, user_id);

    const stats = await getReflectionStatsForDateRange(
      user_id,
      new Date(startDate),
      new Date(endDate)
    );

    console.log('Requested ReflectionsStat:', stats);

    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
}

const getReflectionStatsForDateRange = async (
  user_id: string,
  startDate: Date,
  endDate: Date
) => {

  const reflectionStats = await ReflectionModel.aggregate([
    {
      $match: {
        user_id: idToObjectId(user_id),
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: null,
        completed: { $sum: { $cond: ["$completed", 1, 0] } },
      },
    },
    {
      $project: {
        _id: 0, // Exclude `_id` field from the output
        completed: 1,
      },
    },
  ]);

  console.log('ReflectionStats:', reflectionStats);

  

  return reflectionStats[0] as StatBase;
}
