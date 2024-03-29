import { Request } from 'express'
import { formatCurrentTimestamp } from '../../utils/date-time'
import { TARGET_UPLOAD } from '../common/constant'
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage'

export const uploadSingleFile = async (req: any) => {
  try {
    // Initialize Cloud Storage and get a reference to the service
    const storage = getStorage()

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

    return downloadURL
  } catch (error) {}
}

export const uploadFileFilter = (req: Request, file, cb) => {
  // The function should call `cb` with a boolean
  // to indicate if the file should be accepted

  // To reject this file pass `false`, like so:
  // cb(null, false)

  // To accept the file pass `true`, like so:
  // cb(null, true)

  // You can always pass an error if something goes wrong:
  // cb(new Error("I don't have a clue!"))

  if (req.params.target && req.params.target === TARGET_UPLOAD['profile-image']) {
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
      return cb(new Error('Only image files are allowed!'), false)
    }
    cb(null, true)
  }

  if (req.params.target && req.params.target === TARGET_UPLOAD.cv) {
    cb(null, true)
  }

  cb(null, false)
}

export const getFirebaseStorageUrl = (req): string => {
  const dateTime = formatCurrentTimestamp()
  const defaultFirebaseStorageUrl = `images/${req.file.originalname + '_' + dateTime}`
  let url: string

  switch (req.params.target) {
    case TARGET_UPLOAD['profile-image']:
      url = `images/profiles/${req.body.decodedId}`
      break

    default:
      url = defaultFirebaseStorageUrl
      break
  }

  return url
}
