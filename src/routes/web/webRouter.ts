import express, { Request, Response } from 'express'

const webRouter = express.Router()

webRouter.get('/', (req: Request, res: Response) => {
  res.render('index')
})

export default webRouter
