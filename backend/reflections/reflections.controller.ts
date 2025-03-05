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
