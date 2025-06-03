import {Router} from 'express'
import { checkEmail, login, register } from './users.controller'
import { sendPasswordResetLink, setNewPassword } from './users.resetPassword'
import { getTourCompletedStatus, setTourCompleteStatusTrue } from './users-tour.controller'
import { checkToken } from './users.middleware'
import { getUserDetails, updateUser } from './update-user.controller'
import { sendTestEmailController } from './testEmailSender'


const router = Router()


router.post('/register', register)
router.post('/login', login)

router.get('/check-email', checkEmail)
router.post('/reset-password', sendPasswordResetLink)
router.post('/set-new-password', setNewPassword)
  
router.get('/me', checkToken, getUserDetails);
router.patch('/me/update', checkToken, updateUser);
router.get('/tour-status', checkToken, getTourCompletedStatus);
router.patch('/tour-complete', checkToken, setTourCompleteStatusTrue);

router.post('/send-test-email', sendTestEmailController);

export const userRouter = router