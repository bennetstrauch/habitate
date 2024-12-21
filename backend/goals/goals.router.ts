import {Router} from 'express'
import { addHabit, deleteGoal, getGoal, getGoals, postGoal, putGoal } from './goals.controller'


const router = Router()

//## standardize
router.get('/', getGoals)
router.post('/', postGoal)

router.get('/:goal_id', getGoal)
router.put('/:goal_id', putGoal)
router.delete('/:goal_id', deleteGoal)

router.post('/:goal_id/habits', addHabit)





export const goalRouter = router