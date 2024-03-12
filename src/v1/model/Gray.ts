import mongoose from 'mongoose'
import { IGray, IUser, IGrayCategory } from '../common/interfaces'

const { Schema } = mongoose

const graySchema = new Schema(
  {
    _id: Schema.Types.ObjectId,
    name: {
      type: String,
    },
    createdAt: String,
    // author: {
    //   type: mongoose.Model<IUser>,
    // },
    // category: { type: mongoose.Model<IGrayCategory> },
    cost: Number,
    downloadLink: String,
  },
  { strict: true },
)

const Gray: mongoose.Model<IGray> = mongoose.model<IGray>('Gray', graySchema, 'gray')

export default Gray
