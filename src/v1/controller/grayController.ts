import { Request, Response } from 'express'

import { STATUS } from '../common/constant'
import { IResponseJson } from '../common/interfaces'
import Gray from '../model/Gray'
import { isValidId } from '../helpers/helpers'
import User from '../model/User'

export const getGrayById = async (req: Request, res: Response) => {
  try {
    if (!isValidId(req.params._id)) {
      return res.status(400).json({ result: STATUS.FAIL, errors: 'Invalid id' } as IResponseJson)
    }

    const data = await Gray.findOne({ _id: req.params._id })

    if (data) {
      const gray = data.toObject()
      delete gray.downloadLink

      res.status(200).json({ result: STATUS.SUCCESS, data: gray } as IResponseJson)
    } else {
      res.status(403).json({ result: STATUS.NOT_FOUND } as IResponseJson)
    }
  } catch (error) {
    res.status(500).json({ result: STATUS.FAIL, message: error } as IResponseJson)
  }
}

export const payDownload = async (req: Request, res: Response) => {
  if (!isValidId(req.body.decodedId)) {
    return res.status(400).json({ result: STATUS.FAIL, errors: 'Invalid user id' } as IResponseJson)
  }

  if (!isValidId(req.params._id)) {
    return res.status(400).json({ result: STATUS.FAIL, errors: 'Invalid gray id' } as IResponseJson)
  }

  const user = await User.findOne({ _id: req.body.decodedId })

  const gray = await Gray.findOne({ _id: req.params._id })

  console.log('111 user', user)
  console.log('111 gray', gray)

  res.json({ msg: 'ok' })
}
