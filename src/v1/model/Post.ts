import mongoose from 'mongoose'
import { IPost, IUser } from '../common/interfaces'

const { Schema } = mongoose

// _id: Schema.Types.ObjectId
//   title: string
//   content: string
//   author: IUser
//   rating: IRating[]
//   comment: IComment[]

const postSchema = new Schema(
  {
    _id: Schema.Types.ObjectId,
    title: {
      type: String,
    },
    content: {
      type: String,
    },
    author: {
      type: mongoose.Model<IUser>,
    },
  },
  { strict: true },
)

const Post: mongoose.Model<IPost> = mongoose.model('Post', postSchema, 'post') as any

export default Post
