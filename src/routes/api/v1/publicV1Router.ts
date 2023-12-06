import express, { Router } from 'express'
import { postLogin, verifyUser } from '../../../controller/authController'
import { registerUser } from '../../../controller/userController'

const publicV1Router: Router = express.Router()

publicV1Router.post('/login', postLogin)
publicV1Router.post('/register', registerUser)
publicV1Router.get('/verify-user/:confirm_code', verifyUser)

export default publicV1Router
