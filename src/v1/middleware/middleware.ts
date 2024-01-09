import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { getRedisValue } from '../helpers/redis'
import { JWT_HEADER_NAME, STATUS } from '../constant/constant'
import { formatRedisBlackListTokenKey, getTokenFromHeader } from '../helpers/helpers'

export const authMiddleware = async (req: Request, res: Response, next) => {
  const token = getTokenFromHeader(req.header(JWT_HEADER_NAME))

  if (!token) return res.status(401).json({ status: STATUS.FAIL, message: 'Access Denied' })

  jwt.verify(token, process.env.TOKEN_SECRET, async (errors, decoded: any) => {
    if (errors) {
      return res.status(400).json({ status: STATUS.FAIL, message: errors })
    } else if (decoded) {
      const { _id, role } = decoded
      req.body.decodedId = _id
      req.body.decodedRole = role
      const isBlacklistToken = await getRedisValue(formatRedisBlackListTokenKey(token, _id))

      if (!isBlacklistToken) {
        next()
      } else return res.status(401).json({ status: STATUS.FAIL, message: 'Access Denied' })
    }
  })
}

export const permitMiddleware = (permittedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.body.decodedRole && permittedRoles.includes(req.body.decodedRole)) {
      next()
    } else {
      res.status(401).json({ status: STATUS.FAIL, message: 'Unauthorized' })
    }
  }
}
