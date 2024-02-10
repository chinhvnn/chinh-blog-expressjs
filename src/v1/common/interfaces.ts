export interface MulterRequest extends Request {
  file: any
}

export interface IResponseJson {
  result: string
  data?: any
  message?: string
  errors?: any
}

export interface IUser {
  _id: any
  email: string
  password: string
  name?: string
  birthDate?: string
  phone?: string
  address?: string
  role?: string
  isActive?: boolean
}

export interface IUserInput extends Omit<IUser, '_id' | 'email' | 'role' | 'isActive' | 'profileImgUrl'> {}
