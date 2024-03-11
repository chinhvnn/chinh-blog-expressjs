import { Schema } from 'mongoose'

// App
export interface MulterRequest extends Request {
  file: any
}

export interface IResponseJson {
  result: string
  data?: any
  message?: string
  errors?: any
}

// User
export interface IUser {
  _id: Schema.Types.ObjectId
  email: string
  password: string
  name?: string
  birthDate?: string
  phone?: string
  address?: string
  role?: string
  isActive?: boolean
}

export interface IAuthUser extends Omit<IUser, 'password'> {}

export interface IUserInput extends Omit<IUser, '_id' | 'email' | 'role' | 'isActive' | 'profileImgUrl'> {}

// Post
export enum ERatingType {
  LIKE,
  UNLIKE,
}

export interface IRating {
  _id: Schema.Types.ObjectId
  type: ERatingType
  count: number
}

export interface IComment {
  _id: Schema.Types.ObjectId
  comment: string
  author: IUser
  subComment: ISubComment
}

export interface ISubComment extends Omit<IComment, 'subComment'> {}

export interface IPost {
  _id: Schema.Types.ObjectId
  title: string
  content: string
  author: IUser
  rating?: IRating[]
  comment?: IComment[]
}
