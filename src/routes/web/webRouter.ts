import express, { Request, Response } from 'express'

const webRouter = express.Router()

webRouter.get('/', (req: Request, res: Response) => {
  return res.render('index', {
    title: `Chinh 's blog API`,
  })
})

export default webRouter
