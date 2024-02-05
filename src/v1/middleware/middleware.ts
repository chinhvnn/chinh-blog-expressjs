import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import multer from 'multer'
import { getStorage } from 'firebase/storage'

import { getRedisValue } from '../helpers/redis'
import { JWT_HEADER_NAME, STATUS, TARGET_UPLOAD } from '../common/constant'
import { formatRedisBlackListTokenKey, getTokenFromHeader } from '../helpers/helpers'
import { uploadFileFilter } from '../helpers/uploadFile'
import { MessageRes } from '../../utils/message-response'

// AUTH
export const authMiddleware = async (req: Request, res: Response, next: any) => {
  const token = getTokenFromHeader(req.header(JWT_HEADER_NAME || '') || '')

  if (!token) return res.status(401).json({ status: STATUS.FAIL, message: MessageRes.AccessDenied })

  jwt.verify(token, process.env.TOKEN_SECRET || '', async (errors: any, decoded: any) => {
    if (errors) {
      return res.status(400).json({ status: STATUS.FAIL, message: MessageRes.JWTErrors, errors })
    } else if (decoded) {
      const { _id, role } = decoded
      req.body.decodedId = _id
      req.body.decodedRole = role

      const isBlacklistToken = await getRedisValue(formatRedisBlackListTokenKey(token, _id))

      if (!isBlacklistToken) {
        next()
      } else return res.status(401).json({ status: STATUS.FAIL, message: MessageRes.AccessDenied })
    }
  })
}

// ONLY LOGIN USER AND PERMITTED ROLES
export const permitUserLogin = (permittedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { decodedId, decodedRole } = req.body
    if (decodedId === req.body._id || decodedId === req.params._id || permittedRoles.includes(decodedRole)) {
      next()
    } else {
      return res.status(401).send({ status: STATUS.FAIL, message: MessageRes.AccessDenied })
    }
  }
}

// PERMISSION
export const permitMiddleware = (permittedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.body.decodedRole && permittedRoles.includes(req.body.decodedRole)) {
      next()
    } else {
      return res.status(401).json({ status: STATUS.FAIL, message: MessageRes.Unauthorized })
    }
  }
}

// UPLOAD MIDDLEWARE (multer middleware)
export const uploadMiddleware = (req: any, res: Response, next: NextFunction) => {
  // Check target
  if (!req.params.target || !TARGET_UPLOAD[req.params.target]) {
    return res.status(400).json({ status: STATUS.FAIL, message: MessageRes.PageNotFound })
  }

  // Initialize Cloud Storage and get a reference to the service
  const storage = getStorage()

  // Setting up multer as a middleware to grab photo uploads
  const upload = multer({ storage: multer.memoryStorage(), fileFilter: uploadFileFilter })

  const decodedId = req.body.decodedId
  const decodedRole = req.body.decodedRole

  return upload.single('file')(req as Request, res, (errors) => {
    if (errors instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      return res.status(400).json({ status: STATUS.FAIL, message: 'A Multer error occurred when uploading', errors })
    } else if (errors) {
      // An unknown error occurred when uploading.
      return res.status(400).json({ status: STATUS.FAIL, message: 'An unknown error occurred when uploading', errors })
    }

    // Everything went fine.
    req.body.decodedId = decodedId
    req.body.decodedRole = decodedRole
    console.log('111 req.file', req.file)

    next()
  })
}
