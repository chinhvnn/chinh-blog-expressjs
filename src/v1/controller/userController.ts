import { Request, Response } from 'express'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import cloneDeep from 'lodash/fp/cloneDeep'

import User from '../model/User'
import { JWT_CONFIRM_CODE_EXPIRATION, PAGE_SIZE, ROLE, ROLE_LEVEL, STATUS } from '../common/constant'
import { getPageCursor, isValidEmail, isValidId, isValidPassword, isValidRole } from '../helpers/helpers'
import { mockUsers } from '../helpers/mockData'
import { sendEmail, sendVerifyUserConfirmCode } from '../helpers/nodemailer'
import { IResponseJson, IUser, IUserInput } from '../common/interfaces'
import { MessageRes } from '../../utils/message-response'

// Leader only get users of their team
export const getUsers = (req: Request, res: Response) => {
  const pageCursor = getPageCursor(req.query.page)
  User.find({})
    .skip(pageCursor.start - 1) // skip will be scan all col-data, if remove, let use index and id to find to more performance
    .limit(PAGE_SIZE + 1)
    .then((data: IUser[]) => {
      if (data.length > 0) {
        const pageData = data.length > PAGE_SIZE ? [...data].slice(0, PAGE_SIZE - 1) : data
        res.json({
          status: STATUS.SUCCESS,
          data: { users: pageData, pageInfo: { ...pageCursor, hasNextPages: data.length > PAGE_SIZE } },
        } as IResponseJson)
      } else {
        res.json({ status: STATUS.NOT_FOUND, data } as IResponseJson)
      }
    })
    .catch((errors: any) => {
      res.status(500).json({ status: STATUS.FAIL, errors } as IResponseJson)
    })
}

// Leader only get user of their team
export const getUserById = (req: Request, res: Response) => {
  if (!isValidId(req.params._id)) {
    return res.status(400).json({ status: STATUS.FAIL, errors: 'Invalid id' } as IResponseJson)
  }

  User.findById({ _id: req.params._id })
    .then((data: any) => {
      if (data) {
        res.json({ status: STATUS.SUCCESS, data } as IResponseJson)
      } else {
        res.json({ status: STATUS.NOT_FOUND, data } as IResponseJson)
      }
    })
    .catch((errors: any) => {
      res.status(500).json({ status: STATUS.FAIL, errors } as IResponseJson)
    })
}

// This controller is public
export const registerUser = async (req: Request, res: Response) => {
  const { email, password, birthDate, name, role }: IUser = req.body

  let validations: string[] = []
  if (!isValidPassword(password) || !isValidEmail(email)) {
    validations.push('Invalid email or password format')
  }
  if (validations.length > 0) {
    return res.status(400).json({ status: STATUS.FAIL, message: validations })
  }

  const salt = bcrypt.genSaltSync(10)
  const hashPassword = bcrypt.hashSync(req.body.password, salt)

  const user = new User({
    _id: new mongoose.Types.ObjectId(),
    email: req.body?.email || '',
    password: hashPassword,
    birthDate: birthDate || '',
    name: name || '',
    role: role,
    isActive: false,
  })

  user
    .save()
    .then((data: any) => {
      res.json({ status: STATUS.SUCCESS, data })
      sendVerifyUserConfirmCode(data)
    })
    .catch((errors: any) => {
      res.status(500).json({ status: STATUS.FAIL, errors })
    })
}

// Leader only delete user of their team
export const deleteUser = (req: Request, res: Response) => {
  if (!isValidId(req.body._id)) {
    return res.send(400).json({ status: STATUS.FAIL, message: 'Invalid id' })
  }

  User.findByIdAndDelete({ _id: req.body._id })
    .then((data: any) => {
      if (data.deletedCount) {
        res.json({ status: STATUS.SUCCESS, data })
      } else {
        res.status(500).json({ status: STATUS.FAIL, errors: { message: 'This item does not exist', data } })
      }
    })
    .catch((errors: any) => {
      res.status(500).json({ status: STATUS.FAIL, errors })
    })
}

export const updateUser = async (req: Request | any, res: Response) => {
  if (!isValidId(req.body._id)) {
    return res.status(400).send({ status: STATUS.FAIL, errors: 'Invalid id' })
  }

  const userInput = {} as IUserInput
  Object.keys(req.body).map((key) => {
    if (
      ['name', 'password', 'birthDate', 'phone', 'address', 'isActive'].includes(key) &&
      typeof req.body[key] !== 'undefined'
    ) {
      userInput[key] = req.body[key]
    }
  })

  if (Object.keys(userInput).length === 0) {
    return res.status(400).send({ status: STATUS.FAIL, message: MessageRes.InputErrors })
  }

  User.updateOne({ _id: req.body._id }, userInput, { runValidators: true })
    .then((data: any) => {
      res.send({ status: STATUS.SUCCESS, data })
    })
    .catch((errors: any) => {
      res.status(500).send({ status: STATUS.FAIL, errors })
    })
}

export const mockUsersController = async (req: Request, res: Response) => {
  if (req.body.userNumber) {
    const data = await mockUsers(parseInt(req.body.userNumber))
    res.json({ status: STATUS.SUCCESS, data })
  } else {
    res.status(400).json({ status: STATUS.FAIL, message: 'Invalid user number' })
  }
}
