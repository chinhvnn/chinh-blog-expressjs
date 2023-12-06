import express, { Router } from 'express'
import { postLogin } from '../../../controller/authController'

const userV1Router: Router = express.Router()

userV1Router.post('/login', postLogin)

export default userV1Router
