import { Request, Response } from 'express'
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage'

import { formatCurrentTimestamp } from '../../utils/date-time'
import { IResponseJson, MulterRequest } from '../common/interfaces'
import { STATUS } from '../common/constant'
import { getFirebaseStorageUrl } from '../helpers/helpers'
import User from '../model/User'

export const uploadSingleFile = async (req: any, res: Response) => {
  try {
    // Initialize Cloud Storage and get a reference to the service
    const storage = getStorage()

    if (!req.file) {
      return res.status(400).json({
        status: STATUS.FAIL,
        message: 'No file uploaded',
      } as IResponseJson)
    }

    const url = getFirebaseStorageUrl(req)

    const storageRef = ref(storage, url)

    // Create file metadata including the content type
    const metadata = {
      contentType: req.file.mimetype,
    }

    // Upload the file in the bucket storage
    const snapshot = await uploadBytesResumable(storageRef, req.file.buffer, metadata)
    //by using uploadBytesResumable we can control the progress of uploading like pause, resume, cancel

    // Grab the public url
    const downloadURL = await getDownloadURL(snapshot.ref)

    // Set database
    setDatabase(req.params.target, req.body.decodedId, downloadURL)
      .then((data: any) => {
        return res.send({
          status: STATUS.SUCCESS,
          message: 'file uploaded to firebase storage',
          data: {
            name: req.file.originalname,
            type: req.file.mimetype,
            downloadURL: downloadURL,
          },
        })
      })
      .catch((errors: any) => {
        res.status(500).json({ message: STATUS.FAIL, errors })
      })
  } catch (error) {
    return res.status(400).json({
      status: STATUS.FAIL,
      errors: error,
    } as IResponseJson)
  }
}

const setDatabase = async (target, _id, url) => {
  return User.updateOne({ _id }, { profile_img_url: url })
}
