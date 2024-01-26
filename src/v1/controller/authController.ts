import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

import User from '../model/User'
import { JWT_TOKEN_EXPIRATION, JWT_HEADER_NAME, REDIS_RESULT, STATUS } from '../common/constant'
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
import { sendVerifyUserConfirmCode } from '../helpers/nodemailer'

export const postLogin = async (req: Request, res: Response) => {
  if (!isValidEmail(req.body.email) || !isValidPassword(req.body.password)) {
    return res.json({ status: STATUS.FAIL, message: 'Invalid email or password format' })
  }

  User.findOne({ email: req.body.email })
    .then(async (data: any) => {
      if (data) {
        if (bcrypt.compareSync(req.body.password, data.password) && data.isActive) {
          const user = data.toObject()
          delete user.password
          const token = jwt.sign({ _id: user._id, role: user.role }, process.env.TOKEN_SECRET || '', {
            expiresIn: JWT_TOKEN_EXPIRATION,
          })

          // save user token on Redis
          setRedisValue(formatRedisActiveTokenKey(token, user._id), `"${token}"`, { EX: JWT_TOKEN_EXPIRATION })
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
          res.json({ status: STATUS.FAIL, message: 'Wrong password or User not activated' })
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
  const token: any = getTokenFromHeader(req.header(JWT_HEADER_NAME || '') || '')
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
            res.status(500).json({ status: STATUS.FAIL, message: errors })
          })
      }
    }
    res.json({ status: STATUS.SUCCESS, data: activeKeys })
  } else {
    res.status(500).json({ status: STATUS.FAIL })
  }
}

export const sendVerifyUserConfirmCodeToEmail = async (req: Request, res: Response) => {
  const { email } = req.params as any

  if (!isValidEmail(email)) {
    return res.json({ status: STATUS.FAIL, message: 'Invalid email' })
  }

  User.findOne({ email: req.body.email })
    .then((data) => {
      if (!data) {
        sendVerifyUserConfirmCode({ email } as any)
      }
    })
    .catch((err) => {
      res.status(500).json({ status: STATUS.FAIL, message: err })
    })
}

export const verifyUser = async (req: Request, res: Response) => {
  const { confirm_code } = req.params as any

  if (!confirm_code) return res.status(401).json({ status: STATUS.FAIL, message: 'Invalid Confirm code' })

  jwt.verify(confirm_code, process.env.TOKEN_SECRET || '', async (errors: any, decoded: any) => {
    if (errors) {
      return res.status(400).json({ status: STATUS.FAIL, message: errors })
    } else if (decoded) {
      const { email } = decoded
      try {
        const currentConfirmCode = await getRedisValue(`confirm-code-${email}`)
        if (currentConfirmCode === confirm_code) {
          const updateUser = await User.updateOne(
            { email, isActive: false },
            {
              $set: { isActive: true },
            },
          )
          if (updateUser) {
            await removeRedisValue(`confirm-code-${email}`)
            return res.json({ status: STATUS.SUCCESS, data: updateUser })
          } else {
            return res.status(500).json({ status: STATUS.FAIL })
          }
        } else {
          return res.status(401).json({ status: STATUS.FAIL, message: 'Access Denied' })
        }
      } catch (error) {
        return res.status(500).json({ status: STATUS.FAIL, message: error })
      }
    } else return res.status(401).json({ status: STATUS.FAIL, message: 'Access Denied' })
  })
}
