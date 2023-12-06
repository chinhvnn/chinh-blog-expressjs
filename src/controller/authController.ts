import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../model/User'
import { JWT_EXPIRATION, JWT_HEADER_NAME, REDIS_RESULT, STATUS } from '../constant/constant'
import {
  isValidEmail,
  isValidId,
  isValidPassword,
  formatRedisActiveTokenKey,
  formatRedisBlackListTokenKey,
  getTokenFromHeader,
  formatToken,
} from '../helpers/helpers'
import {
  getRedisActiveKeyByUserId,
  getRedisValue,
  removeRedisValue,
  renameRedisKey,
  setRedisValue,
} from '../helpers/redis'

export const postLogin = async (req: Request, res: Response) => {
  if (!isValidEmail(req.body.email) || !isValidPassword(req.body.password)) {
    return res.json({ status: STATUS.FAIL, message: 'Invalid email or password format' })
  }

  User.findOne({ email: req.body.email })
    .then(async (data: any) => {
      if (data) {
        if (bcrypt.compareSync(req.body.password, data.password)) {
          const user = data.toObject()
          delete user.password
          const token = jwt.sign({ _id: user._id, role: user.role }, process.env.TOKEN_SECRET, {
            expiresIn: JWT_EXPIRATION,
          })
          // save user token on Redis
          setRedisValue(formatRedisActiveTokenKey(token, user._id), `"${token}"`, { EX: JWT_EXPIRATION })
            .then((result) => {
              if (result === REDIS_RESULT.OK) {
                res.json({ status: STATUS.SUCCESS, data: user, token: formatToken(token) })
              } else {
                res.status(500).json({ status: STATUS.FAIL, message: 'redis error' })
              }
            })
            .catch((errors: any) => {
              res.status(500).json({ status: STATUS.FAIL, message: 'redis error' })
            })
        } else {
          res.json({ status: STATUS.FAIL, message: 'Wrong password' })
        }
      } else {
        return res.json({ status: STATUS.FAIL, message: 'Email does not exist' })
      }
    })
    .catch((errors: any) => {
      res.status(500).json({ status: STATUS.FAIL, message: errors })
    })
}

// This function is wrapped under the authentication middleware
export const postLogout = async (req: Request, res: Response) => {
  const token = getTokenFromHeader(req.header(JWT_HEADER_NAME))
  // save blacklist token redis value
  const result = await setRedisValue(formatRedisBlackListTokenKey(token, req.body.decodedId), `"${token}"`)
  if (result === REDIS_RESULT.OK) {
    res.json({ status: STATUS.SUCCESS })
  } else {
    res.status(500).json({ status: STATUS.FAIL, message: 'Redis errors' })
  }
}

// This function is wrapped under the authentication middleware
export const postLogoutAll = async (req: Request, res: Response) => {
  const activeKeys = await getRedisActiveKeyByUserId(req.body._id)
  if (activeKeys) {
    let count = 0
    if (activeKeys.length > 0) {
      for (let index = 0; index < activeKeys.length; index++) {
        renameRedisKey(activeKeys[index], activeKeys[index].replace('active', 'inactive'))
          .then((result: any) => {
            if (result === REDIS_RESULT.OK) {
              count += 1
            }
          })
          .catch((errors) => {
            res.status(500).json({ status: STATUS.FAIL, errors })
          })
      }
    }
    res.json({ status: STATUS.SUCCESS, data: activeKeys })
  } else {
    res.status(500).json({ status: STATUS.FAIL })
  }
}
