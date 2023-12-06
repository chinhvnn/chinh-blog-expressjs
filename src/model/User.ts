import mongoose from 'mongoose'
import { isValidEmail, isValidPassword } from '../helpers/helpers'

const { Schema } = mongoose

const userSchema = new Schema(
  {
    _id: Schema.Types.ObjectId,
    email: {
      type: String,
      required: true,
      index: true, // db.createIndex()
      unique: true,
      validate: {
        validator: (val) => isValidEmail(val),
        message: 'Invalid email format',
      },
    },
    name: {
      type: String,
    },
    password: {
      type: String,
      validate: {
        validator: (val) => isValidPassword(val),
        message: 'Password must be at least 6 character',
      },
      required: true,
    },
    birthDate: {
      type: Date,
    },
    role: String,
  },
  { strict: true },
)

const User: mongoose.Model<any> = mongoose.model('User', userSchema, 'user')

export default User
