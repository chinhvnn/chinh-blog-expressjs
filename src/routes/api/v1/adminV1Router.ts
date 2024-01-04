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

adminV1Router.get('/users', permit(ROLE_LEVEL.LEADER), getUsers)
adminV1Router.get('/user/:_id', permit(ROLE_LEVEL.LEADER), getUserById)
adminV1Router.put('/user', permit(ROLE_LEVEL.ADMIN), updateUser)
adminV1Router.delete('/user', permit(ROLE_LEVEL.ADMIN), deleteUser)
adminV1Router.post('/mock-user', permit(ROLE_LEVEL.ADMIN), mockUsersController)

/**
 * @swagger
 * /api/v1/admin/logout:
 *      post:
 *          summary: Logout
 *          tags:
 *              - api/v1
 *          description: Logout account.
 *          responses:
 *              201:
 *                  description: Success
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: string
 *                                      example: success
 *              500:
 *                  description: Internal server error
 */
adminV1Router.post('/logout', postLogout)

/**
 * @swagger
 * /api/v1/admin/logout-all:
 *      post:
 *          summary: Logout All
 *          tags:
 *              - api/v1
 *          description: Logout account all devices.
 *          responses:
 *              201:
 *                  description: Success
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: string
 *                                      example: success
 *              500:
 *                  description: Internal server error
 */
adminV1Router.post('/logout-all', permit(ROLE_LEVEL.ADMIN), postLogoutAll)

export default adminV1Router
