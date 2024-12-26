import { Goal, GoalBase, GoalModel, Habit } from "./goals.model";
import { RequestHandler } from 'express'
import { ErrorWithStatus } from '../utils/classes'
import { StandardResponse } from "../types/standardResponse";
import { generateEmbedding } from "./embedding";


type GetGoalsReqHandler = RequestHandler<unknown, StandardResponse<Goal[]>>

export const getGoals: GetGoalsReqHandler = async (req, res, next) => {

    try {
        const results : Goal[] = await GoalModel.find({ createdByUserWithId: req.userId })
        res.json({ success: true, data: results });

    } catch (err) {
        next(err);
    }
};


type GetGoalReqHandler = RequestHandler<{ goal_id: string; }, StandardResponse<Goal | null>>

export const getGoal: GetGoalReqHandler = async (req, res, next) => {

    try {
        const { goal_id } = req.params;

        const goal = await GoalModel.findOne({ _id: goal_id, createdByUserWithId: req.userId }) as Goal | null;

        if (!goal) {
            throw new ErrorWithStatus('Goal not found', 404);
        }

        res.json({ success: true, data: goal });

    } catch (err) {
        next(err);
    }
};


export const postGoal: RequestHandler<unknown, StandardResponse<Goal>, GoalBase> = async (req, res, next) => {

    try {
        const goalBase = req.body
        const embedded_name = await generateEmbedding(goalBase.name)



        const result = await GoalModel.create({
            ...goalBase,
            embedded_name,
            createdByUserWithId: req.userId
        });

        res.json({ success: true, data: result as Goal });

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


export const deleteHabit: RequestHandler<{ goal_id: string, habit_id: string; }, StandardResponse<number>> = async (req, res, next) => {
    
    try {
        const { goal_id, habit_id } = req.params;

        const result = await GoalModel.updateOne(
            { _id: goal_id, createdByUserWithId: req.userId },
            { $pull: { habits: { _id: habit_id } } }
            );

            res.status(200).json({ success: true, data: result.modifiedCount });

        } catch (err) {
            next(err);
            }
            
           
};

type GetHabbitsReqHandler = RequestHandler<{ goal_id: string; }, StandardResponse<Habit[]>>

// ## two times getHabit functionality used here, abstract
export const getHabits: GetHabbitsReqHandler = async (req, res, next) => {
    try {
        const { goal_id } = req.params;
        const goal = await GoalModel.findOne({ _id: goal_id, createdByUserWithId: req.userId }) as Goal | null;

        if (!goal) {
            throw new ErrorWithStatus('Goal not found', 404);
        }

        res.json({ success: true, data: goal.habits });
        
    } catch (err) {
        next(err);
    }
};