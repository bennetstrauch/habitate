import {Router} from 'express'
import { checkEmail, login, register } from './users.controller'
import { sendPasswordResetLink, setNewPassword } from './users.resetPassword'
import { getTourCompletedStatus, setTourCompleteStatusTrue } from './users-tour.controller'
import { checkToken } from './users.middleware'
import { getUserDetails, updateUser } from './update-user.controller'
import { sendTestEmailController } from './testEmailSender'
import { connect, getConnections, getInviteCode, regenerateInviteCode, removeConnection } from './uplifters.controller'


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

router.get('/me/invite-code', checkToken, getInviteCode);
router.post('/me/invite-code/regenerate', checkToken, regenerateInviteCode);
router.get('/connections', checkToken, getConnections);
router.post('/connect', checkToken, connect);
router.delete('/connections/:friendId', checkToken, removeConnection);

export const userRouter = router