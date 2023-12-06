import express, { Router } from 'express'
import { postLogin } from '../../../controller/authController'

const publicV1Router: Router = express.Router()

publicV1Router.post('/login', postLogin)

export default publicV1Router
