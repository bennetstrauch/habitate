import {Router} from 'express'
import { checkEmail, login, register } from './users.controller'


const router = Router()


router.post('/register', register)
router.post('/login', login)

router.get('/check-email', checkEmail)


export const userRouter = router