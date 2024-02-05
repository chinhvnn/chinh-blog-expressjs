import mongoose from 'mongoose'
import { isValidEmail, isValidPassword } from '../helpers/helpers'
import { IUser } from '../common/interfaces'

const { Schema } = mongoose

const userSchema = new Schema(
  {
    _id: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    email: {
      type: String,
      required: true,
      index: true, // db.createIndex()
      unique: true,
      validate: {
        validator: (val: any) => isValidEmail(val),
        message: 'Invalid email format',
      },
    },
    password: {
      type: String,
      required: true,
      validate: {
        validator: (val: string) => isValidPassword(val),
        message: 'Password must be at least 6 character',
      },
    },
    name: {
      type: String,
    },
    birthDate: {
      type: String,
    },
    phone: {
      type: String,
    },
    address: {
      type: String,
    },
    profileImgUrl: {
      type: String,
    },
    role: String,
    isActive: Boolean,
  },
  { strict: true },
)

const User: mongoose.Model<IUser> = mongoose.model('User', userSchema, 'user') as any

export default User
