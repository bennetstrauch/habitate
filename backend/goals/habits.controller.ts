import { RequestHandler } from "express";
import { Goal, GoalModel, Habit } from "./goals.model";
import { StandardResponse } from "../types/standardResponse";
import { ErrorWithStatus } from "../utils/classes";
import { handleAddHabitHelp } from "./ai/aiHelp";
import { findOneGoalHelper } from "./goals.controller";




type GetHabbitsReqHandler = RequestHandler<{ goal_id: string; }, StandardResponse<Habit[]>>

// ## two times getHabit functionality used here, abstract
export const getHabits: GetHabbitsReqHandler = async (req, res, next) => {
    try {
        const { goal_id } = req.params;
        const goal = await findOneGoalHelper(goal_id, req.userId);

        if (!goal) {
            throw new ErrorWithStatus('Goal not found', 404);
        }

        res.json({ success: true, data: goal.habits });
        
    } catch (err) {
        next(err);
    }
};


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


export const addHabitHelp : RequestHandler<{ goal_id: string; }, StandardResponse<number>> = async (req, res, next) => {

    try {
        const { goal_id } = req.params;
        // const goal = await findOneGoalHelper(goal_id);

        // if (!goal) {
        //     throw new ErrorWithStatus('Goal not found', 404);
        // }


        const response = await handleAddHabitHelp(goal_id);

    } catch (err) {
        next(err);
    }

}
