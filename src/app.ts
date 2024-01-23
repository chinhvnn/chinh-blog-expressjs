import express from 'express'
import createError from 'http-errors'
import path from 'path'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import adminV1Router from './routes/v1/api/adminV1Router'
import publicV1Router from './routes/v1/api/publicV1Router'
import webRouter from './routes/v1/web/webRouter'
import { STATUS, swaggerOptions } from './v1/constant/constant'
import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import { authMiddleware } from './v1/middleware/middleware'
import { APP_VERSION } from './config/dev'

const app = express()
dotenv.config()
// const __dirname: any = path.resolve()

// view engine setup
app.set('views', path.join(__dirname || '', `${APP_VERSION}/views`))
app.set('view engine', 'pug')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname || '', 'public')))

const swaggerSpec = swaggerJSDoc(swaggerOptions(__dirname || ''))

// connect to Mongodb
try {
  mongoose.connect(process.env.MONGODB_URI || '')
  mongoose.connection.on('open', () => {
    console.log('Connect to MongoDB successfully')
  })
} catch (errors) {
  console.log('MongoDB errors', errors)
}

app.use('/', webRouter)
app.use(`/api/${APP_VERSION}`, publicV1Router)
app.use(`/api/${APP_VERSION}/admin`, adminV1Router)
// app.use('/api-docs', authMiddleware, swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err: any, req: express.Request, res: express.Response, next: any) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.json({
    status: STATUS.FAIL,
    err,
    request: { url: req.url, method: req.method, body: req.body, params: req.params },
  })
  // res.render('error')
})

export default app
