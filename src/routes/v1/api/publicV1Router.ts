import express, { Router } from 'express'

import { postLogin, sendVerifyUserConfirmCodeToEmail, verifyUser } from '../../../v1/controller/authController'
import { registerUser } from '../../../v1/controller/userController'
import * as grayController from '../../../v1/controller/grayController'

const publicV1Router: Router = express.Router()

publicV1Router.post('/login', postLogin)
publicV1Router.post('/register', registerUser)
publicV1Router.get('/verify-user/:confirm_code', verifyUser)
publicV1Router.get('/send-verify-code/:email', sendVerifyUserConfirmCodeToEmail)

publicV1Router.get('/grays/:_id', grayController.getGrayById)

export default publicV1Router
