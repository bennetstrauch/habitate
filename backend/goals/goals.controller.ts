import { GoalBase, GoalModel, Habit } from "./goals.model";
import { RequestHandler } from 'express'
import { ErrorWithStatus } from '../utils/classes'
import { StandardResponse } from "../types/standardResponse";


type GetGoalsReqHandler = RequestHandler<unknown, StandardResponse<GoalBase[]>>

export const getGoals: GetGoalsReqHandler = async (req, res, next) => {

    try {
        const results = await GoalModel.find({ createdByUserWithId: req.userId })
        res.json({ success: true, data: results });
    } catch (err) {
        next(err);
    }
};


type GetGoalReqHandler = RequestHandler<{ goal_id: string; }, StandardResponse<GoalBase | null>>

export const getGoal: GetGoalReqHandler = async (req, res, next) => {

    try {
        const { goal_id } = req.params;

        const goal = await GoalModel.findOne({ _id: goal_id, createdByUserWithId: req.userId });

        res.json({ success: true, data: goal });

    } catch (err) {
        next(err);
    }
};


export const postGoal: RequestHandler<unknown, StandardResponse<GoalBase>, GoalBase> = async (req, res, next) => {

    try {
        const result = await GoalModel.create({
            ...req.body,
            createdByUserWithId: req.userId
        });

        res.json({ success: true, data: result });

    } catch (err) {
        next(err);
    }
};


type PutGoalReqHandler = RequestHandler<{ goal_id: string; }, StandardResponse<number>, GoalBase>

export const putGoal: PutGoalReqHandler = async (req, res, next) => {
    
    try {
        const { goal_id } = req.params;
        const result = await GoalModel.updateOne(
            { _id: goal_id, createdByUserWithId: req.userId },
            { $set: req.body }
        );

        res.status(200).json({ success: true, data: result.modifiedCount });

    } catch (err) {
        next(err);
    }
};



// $$ extra controller
export const addHabit: RequestHandler<{ goal_id: string; }, StandardResponse<number>, Habit> = async (req, res, next) => {
    
    try {
        const { goal_id } = req.params;
        const result = await GoalModel.updateOne(
            { _id: goal_id, createdByUserWithId: req.userId },
            { $push: { habits: req.body } }
        );

        res.status(200).json({ success: true, data: result.modifiedCount });

    } catch (err) {
        next(err);
    }
}


export const deleteGoal: RequestHandler<{ goal_id: string; }, StandardResponse<number>> = async (req, res, next) => {
    
    try {
        const { goal_id } = req.params;

        const result = await GoalModel.deleteOne({ _id: goal_id, createdByUserWithId: req.userId });

        res.status(200).json({ success: true, data: result.deletedCount });

    } catch (err) {
        next(err);
    }
};