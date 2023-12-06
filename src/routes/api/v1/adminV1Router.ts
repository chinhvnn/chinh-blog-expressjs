import express, { Router } from 'express'
import {
  registerUser,
  deleteUser,
  getUserById,
  getUsers,
  mockUsersController,
  updateUser,
} from '../../../controller/userController'
import { postLogout, postLogoutAll } from '../../../controller/authController'
import { authMiddleware, permitMiddleware as permit } from '../../../middleware/middleware'
import { ROLE_LEVEL } from '../../../constant/constant'

const adminV1Router: Router = express.Router()

adminV1Router.use(authMiddleware)

adminV1Router.post('/logout', postLogout)
adminV1Router.post('/logout-all', permit(ROLE_LEVEL.ADMIN), postLogoutAll)

adminV1Router.get('/users', permit(ROLE_LEVEL.LEADER), getUsers)
adminV1Router.get('/user/:_id', permit(ROLE_LEVEL.LEADER), getUserById)
adminV1Router.put('/user', permit(ROLE_LEVEL.ADMIN), updateUser)
adminV1Router.delete('/user', permit(ROLE_LEVEL.ADMIN), deleteUser)
adminV1Router.post('/mock-user', permit(ROLE_LEVEL.ADMIN), mockUsersController)

export default adminV1Router
