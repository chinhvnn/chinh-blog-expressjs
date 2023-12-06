import { Request, Response } from 'express'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import User from '../model/User'
import { PAGE_SIZE, STATUS } from '../constant/constant'
import { getPageCursor, isValidEmail, isValidId, isValidPassword } from '../helpers/helpers'
import { mockUsers } from '../helpers/mockData'

export const getUsers = (req: Request, res: Response) => {
  // Leader only get users of their team
  const pageCursor = getPageCursor(req.query.page)
  User.find({})
    .skip(pageCursor.start - 1)
    .limit(PAGE_SIZE + 1)
    .then((data: any[]) => {
      if (data.length > 0) {
        const pageData = data.length > PAGE_SIZE ? [...data].pop() : data
        res.json({
          status: STATUS.SUCCESS,
          data: { users: pageData, pageInfo: { ...pageCursor, hasNextPage: data.length > PAGE_SIZE } },
        })
      } else {
        res.json({ status: STATUS.NOT_FOUND, data })
      }
    })
    .catch((errors: any) => {
      res.status(500).json({ status: STATUS.FAIL, errors })
    })
}

export const getUserById = (req: Request, res: Response) => {
  if (!isValidId(req.params._id)) {
    return res.status(400).json({ status: STATUS.FAIL, errors: 'Invalid id' })
  }

  // Leader only get user of their team
  User.findById({ _id: req.params._id })
    .then((data: any[]) => {
      if (data) {
        res.json({ status: STATUS.SUCCESS, data })
      } else {
        res.json({ status: STATUS.NOT_FOUND, data })
      }
    })
    .catch((errors: any) => {
      res.status(500).json({ status: STATUS.FAIL, errors })
    })
}

export const addUser = (req: Request, res: Response) => {
  if (!isValidPassword(req.body.password) || !isValidEmail(req.body.email)) {
    return res.status(400).json({ status: STATUS.FAIL, message: 'Invalid email or password format' })
  }

  const salt = bcrypt.genSaltSync(10)
  const hashPassword = bcrypt.hashSync(req.body.password, salt)

  // Leader only add user of their team
  const user = new User({
    _id: new mongoose.Types.ObjectId(),
    email: req.body?.email || '',
    password: hashPassword,
  })

  user
    .save()
    .then((data: any) => {
      res.json({ status: STATUS.SUCCESS, data })
    })
    .catch((errors: any) => {
      res.status(500).json({ status: STATUS.FAIL, errors })
    })
}

export const deleteUser = (req: Request, res: Response) => {
  if (!isValidId(req.body._id)) {
    return res.send(400).json({ message: STATUS.FAIL, errors: 'Invalid id' })
  }

  // Leader only delete user of their team
  User.findByIdAndDelete({ _id: req.body._id })
    .then((data: any) => {
      if (data.deletedCount) {
        res.json({ message: STATUS.SUCCESS, data })
      } else {
        res.json({ message: STATUS.FAIL, errors: { message: 'This item does not exist', data } })
      }
    })
    .catch((errors: any) => {
      res.status(500).json({ message: STATUS.FAIL, errors })
    })
}

export const updateUser = (req: Request, res: Response) => {
  if (!isValidId(req.body._id)) {
    return res.status(400).json({ message: STATUS.FAIL, errors: 'Invalid id' })
  }

  User.updateOne({ _id: req.body._id }, { password: req.body.password }, { runValidators: true })
    .then((data: any) => {
      res.json({ message: STATUS.SUCCESS, data })
    })
    .catch((errors: any) => {
      res.status(500).json({ message: STATUS.FAIL, errors })
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
