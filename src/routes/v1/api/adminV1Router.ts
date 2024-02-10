import express, { Router } from 'express'
import { initializeApp } from 'firebase/app'
import { firebaseConfig } from '../../../config/firebase.config'
import { getStorage } from 'firebase/storage'
import multer from 'multer'

import * as userController from '../../../v1/controller/userController'
import { postLogout, postLogoutAll } from '../../../v1/controller/authController'
import {
  authMiddleware,
  permitMiddleware as permit,
  permitUserLogin,
  uploadMiddleware,
} from '../../../v1/middleware/middleware'
import { ROLE_LEVEL } from '../../../v1/common/constant'
import { uploadSingleFileController } from '../../../v1/controller/uploadFileController'

const adminV1Router: Router = express.Router()

//Initialize a firebase application
initializeApp(firebaseConfig)

// Initialize Cloud Storage and get a reference to the service
const storage = getStorage()

// Setting up multer as a middleware to grab photo uploads
const upload = multer({ storage: multer.memoryStorage() })

adminV1Router.use(authMiddleware)

adminV1Router.get('/users', permit(ROLE_LEVEL.LEADER), userController.getUsers)
adminV1Router.get('/auth', userController.getLoginUser)
adminV1Router.get('/user/:_id', permitUserLogin(ROLE_LEVEL.ADMIN), userController.getUserById)
adminV1Router.put('/user', permitUserLogin(ROLE_LEVEL.ADMIN), userController.updateUser)
adminV1Router.delete('/user', permitUserLogin(ROLE_LEVEL.ADMIN), userController.deleteUser)
adminV1Router.post('/mock-user', permit(ROLE_LEVEL.ADMIN), userController.mockUsersController)

adminV1Router.post('/upload-file/:target', uploadMiddleware, uploadSingleFileController)

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
