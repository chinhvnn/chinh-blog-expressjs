export interface MulterRequest extends Request {
  file: any
}

export interface IResponseJson {
  status: string
  data?: any
  message?: string
  errors?: any
}
