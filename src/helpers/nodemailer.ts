'use strict'
import nodemailer from 'nodemailer'
import jwt from 'jsonwebtoken'
import { ENDPOINT, JWT_CONFIRM_CODE_EXPIRATION } from '../constant/constant'
import { setRedisValue } from './redis'

export const sendEmail = async (email: string, subject: string, text = '', html = '') => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAILER_HOST,
      port: process.env.MAILER_PORT, //TLS use port 465/587/25
      secure: process.env.MAILER_SECURE, //if true TLS is enabled
      auth: {
        user: process.env.MAILER_USER,
        pass: process.env.MAILER_PASSWORD,
      },
    })

    return await transporter.sendMail({
      from: process.env.MAILER_SUBJECT, // sender address
      to: email, // list of receivers 'bar@example.com, baz@example.com'
      subject: subject, // Subject line
      text: text, // plain text body
      html: html, // html body
    })
  } catch (error) {
    return error
  }
}

export const sendVerifyUserConfirmCode = async (userData) => {
  try {
    if (userData && userData.email) {
      const confirmToken = jwt.sign({ email: userData.email }, process.env.CONFIRM_CODE_SECRET, {
        expiresIn: JWT_CONFIRM_CODE_EXPIRATION,
      })
      sendEmail(
        userData.email,
        '9h blog – Sign-Up Confirmation!',
        'Sign-Up Confirmation',
        `<p>Did you sign in to 9h's blog?</p>
        <p>If yes, here is your authorization code:</p>
        <p><b>${ENDPOINT}/verify-user/${confirmToken}</b></p>
        <p>It expires in 5 minutes.</p>`,
      ).then((emailResult) => {
        if (emailResult) {
          setRedisValue(`confirm-code-${userData.email}`, confirmToken, { EX: JWT_CONFIRM_CODE_EXPIRATION })
        }
      })
    }
  } catch (error) {
    console.log(error)
  }
}
