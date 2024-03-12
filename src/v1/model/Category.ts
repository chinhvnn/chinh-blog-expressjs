import mongoose from 'mongoose'
import { IGray, IGrayCategory, IUser } from '../common/interfaces'

const { Schema } = mongoose

const grayCategorySchema = new Schema(
  {
    _id: Schema.Types.ObjectId,
    name: {
      type: String,
    },
    createdAt: String,
  },
  { strict: true },
)

const GrayCategory: mongoose.Model<IGrayCategory> = mongoose.model<IGrayCategory>(
  'Category',
  grayCategorySchema,
  'category',
)

export default GrayCategory
