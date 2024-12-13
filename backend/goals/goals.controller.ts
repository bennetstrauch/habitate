import { Goal, GoalModel } from "../database/schemas/goals.model";
import { RequestHandler } from 'express'
import { ErrorWithStatus, StandardResponse } from '../utils/classes'



export const getGoals: RequestHandler<unknown, StandardResponse<Goal[]>> = async (req, res, next) => {
   
    try {
        const results = await GoalModel.find({ user_id: req.user?._id })

        res.json({ success: true, data: results });
    } catch (err) {
        next(err);
    }
};


export const getGoal: RequestHandler<{ goal_id: string; }, StandardResponse<Goal | null>> = async (req, res, next) => {

    try {
        const { goal_id } = req.params;

        const goal = await GoalModel.findOne({ _id: goal_id, createdByUserWithId: req.user?._id });

        res.json({ success: true, data: goal });

    } catch (err) {
        next(err);
    }
};


export const postGoal: RequestHandler<unknown, StandardResponse<Goal>, Goal> = async (req, res, next) => {

    try {
        const result = await GoalModel.create({
            ...req.body,
            user_id: req.user?._id
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
            { _id: goal_id, user_id: req.user?._id },
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

        const result = await GoalModel.deleteOne({ _id: goal_id, user_id: req.user?._id });

        res.status(200).json({ success: true, data: result.deletedCount });

    } catch (err) {
        next(err);
    }
};