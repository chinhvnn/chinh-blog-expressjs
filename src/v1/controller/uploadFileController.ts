import { Request, Response } from 'express'

import { IResponseJson, MulterRequest } from '../common/interfaces'
import { STATUS, TARGET_UPLOAD } from '../common/constant'
import User from '../model/User'
import { uploadSingleFile } from '../helpers/uploadFile'

export const uploadSingleFileController = async (req: any, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        result: STATUS.FAIL,
        message: 'No file uploaded',
      } as IResponseJson)
    }

    const downloadURL = await uploadSingleFile(req)

    // Set database
    setDatabase(req.params.target, req.body.decodedId, downloadURL)
      .then((data: any) => {
        return res.send({
          result: STATUS.SUCCESS,
          message: 'file uploaded to firebase storage',
          data: {
            name: req.file.originalname,
            type: req.file.mimetype,
            downloadURL: downloadURL,
          },
        })
      })
      .catch((errors: any) => {
        res.status(500).json({ result: STATUS.FAIL, message: 'Error when save database', errors } as IResponseJson)
      })
  } catch (error) {
    return res.status(400).json({
      result: STATUS.FAIL,
      errors: error,
    } as IResponseJson)
  }
}

const setDatabase = (target, _id, url) => {
  let action

  switch (target) {
    case TARGET_UPLOAD['profile-image']:
      action = User.updateOne({ _id }, { profileImgUrl: url })
      break

    default:
      action = new Promise((resolve, reject) => reject('No database set'))
      break
  }

  return action
}
