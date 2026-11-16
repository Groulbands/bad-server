import { Router } from 'express'
import {
    getCurrentUser,
    getCurrentUserRoles,
    login,
    logout,
    refreshAccessToken,
    register,
    updateCurrentUser,
} from '../controllers/auth'
import auth from '../middlewares/auth'
import { getCsrfToken, verifyAnonymousCsrf, verifyCsrf } from '../middlewares/csrf'

const authRouter = Router()

authRouter.get('/user', auth, getCurrentUser)
authRouter.patch('/me', auth, updateCurrentUser)
authRouter.get('/user/roles', auth, getCurrentUserRoles)
authRouter.get('/csrf-token', getCsrfToken)
authRouter.post('/login', verifyAnonymousCsrf, login)
authRouter.post('/token', verifyCsrf, refreshAccessToken)
authRouter.post('/logout', verifyCsrf, logout)
authRouter.post('/register', verifyAnonymousCsrf, register)

export default authRouter
