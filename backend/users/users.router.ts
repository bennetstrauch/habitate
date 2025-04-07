import {Router} from 'express'
import { checkEmail, login, register } from './users.controller'
import { sendPasswordResetLink } from './users.resetPassword'


const router = Router()


router.post('/register', register)
router.post('/login', login)

router.get('/check-email', checkEmail)
router.post('/reset-password', sendPasswordResetLink)


export const userRouter = router