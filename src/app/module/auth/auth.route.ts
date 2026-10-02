import { Router } from 'express'
import { AuthController } from './auth.controller'

const router = Router()

router.post('/register', AuthController.registerCustomer)

router.post('/login', AuthController.loginUser)

router.post('/refresh-token', AuthController.refreshToken)

router.post('/google',AuthController.googleLogin)

export const AuthRoutes = router
