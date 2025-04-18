import {Router} from 'express'
import { checkEmail, login, register } from './users.controller'
import { sendPasswordResetLink, setNewPassword } from './users.resetPassword'
import { getTourCompletedStatus, setTourCompleteStatusTrue } from './users-tour.controller'
import { checkToken } from './users.middleware'


const router = Router()


router.post('/register', register)
router.post('/login', login)

router.get('/check-email', checkEmail)
router.post('/reset-password', sendPasswordResetLink)
router.post('/set-new-password', setNewPassword)

// GET /api/user/tour-status
router.get('/tour-status', checkToken, getTourCompletedStatus);
  
  // PATCH /api/user/tour-complete
router.patch('/tour-complete', checkToken, setTourCompleteStatusTrue);


export const userRouter = router