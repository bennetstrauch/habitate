import {Router} from 'express'
import { deleteGoal, getGoal, getGoals, postGoal, putGoal } from './goals.controller'


const router = Router()

//## standardize
router.get('/', getGoals)
router.post('/', postGoal)

router.get('/:goal_id', getGoal)
router.put('/:goal_id', putGoal)
router.delete('/:goal_id', deleteGoal)




export const goalRouter = router