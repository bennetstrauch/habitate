import {Router} from 'express'
import { checkEmail, login, register } from './users.controller'
import { sendPasswordResetLink, setNewPassword } from './users.resetPassword'


const router = Router()


router.post('/register', register)
router.post('/login', login)

router.get('/check-email', checkEmail)
router.post('/reset-password', sendPasswordResetLink)
router.post('/set-new-password', setNewPassword)


export const userRouter = router