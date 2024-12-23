import {Router} from 'express'
import { addHabit, deleteGoal, deleteHabit, getGoal, getGoals, getHabits, postGoal, putGoal } from './goals.controller'


const router = Router()

//## standardize
router.get('/', getGoals)
router.post('/', postGoal)

router.get('/:goal_id', getGoal)
router.put('/:goal_id', putGoal)
router.delete('/:goal_id', deleteGoal)

router.get('/:goal_id/habits', getHabits)
router.post('/:goal_id/habits', addHabit)
router.delete('/:goal_id/habits/:habit_id', deleteHabit)






export const goalRouter = router