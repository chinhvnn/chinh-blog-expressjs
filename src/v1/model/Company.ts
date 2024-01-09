import mongoose from 'mongoose'
import { isValidEmail, isValidPassword } from '../helpers/helpers'

const { Schema } = mongoose

const companySchema = new Schema(
  {
    _id: Schema.Types.ObjectId,
    name: {
      type: String,
      required: true,
      index: true,
      unique: true,
      minLength: 3,
    },
  },
  { strict: true },
)

const Company: mongoose.Model<any> = mongoose.model('Company', companySchema, 'company')

export default Company
