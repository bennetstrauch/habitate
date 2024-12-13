import { Goal, GoalModel } from "./goals.model";
import { RequestHandler } from 'express'
import { ErrorWithStatus } from '../utils/classes'
import { StandardResponse } from "../types/standardResponse";


type GetGoalsReqHandler = RequestHandler<unknown, StandardResponse<Goal[]>>

export const getGoals: GetGoalsReqHandler = async (req, res, next) => {
   
    try {
        const results = await GoalModel.find({ user_id: req.userId })
        res.json({ success: true, data: results });
    } catch (err) {
        next(err);
    }
};


type GetGoalReqHandler = RequestHandler<{ goal_id: string; }, StandardResponse<Goal | null>>

export const getGoal: GetGoalReqHandler = async (req, res, next) => {

    try {
        const { goal_id } = req.params;

        const goal = await GoalModel.findOne({ _id: goal_id, createdByUserWithId: req.userId });

        res.json({ success: true, data: goal });

    } catch (err) {
        next(err);
    }
};


export const postGoal: RequestHandler<unknown, StandardResponse<Goal>, Goal> = async (req, res, next) => {

    try {
        const result = await GoalModel.create({
            ...req.body,
            user_id: req.userId
        });

        res.json({ success: true, data: result });

    } catch (err) {
        next(err);
    }
};


type PutGoalReqHandler = RequestHandler<{ goal_id: string; }, StandardResponse<number>, Goal>

export const putGoal: PutGoalReqHandler = async (req, res, next) => {
    
    try {
        const { goal_id } = req.params;
        const result = await GoalModel.updateOne(
            { _id: goal_id, user_id: req.userId },
            { $set: req.body }
        );

        res.status(200).json({ success: true, data: result.modifiedCount });

    } catch (err) {
        next(err);
    }
};


export const deleteGoal: RequestHandler<{ goal_id: string; }, StandardResponse<number>> = async (req, res, next) => {
    
    try {
        const { goal_id } = req.params;

        const result = await GoalModel.deleteOne({ _id: goal_id, user_id: req.userId });

        res.status(200).json({ success: true, data: result.deletedCount });

    } catch (err) {
        next(err);
    }
};