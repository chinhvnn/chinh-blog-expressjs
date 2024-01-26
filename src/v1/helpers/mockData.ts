import mongoose from 'mongoose'
import { faker } from '@faker-js/faker'

import User from '../model/User'

export const mockUsers = async (quantity: number) => {
  let userList = [] as any
  try {
    for (let index = 0; index < quantity; index++) {
      const user = await User.create({
        _id: new mongoose.Types.ObjectId(),
        name: faker.person.fullName(),
        email: faker.internet.email(),
        birthDate: faker.date.birthdate(),
        password: 123456,
        role: '',
        isActive: true,
      })
      if (user) userList.push(user)
    }
    return userList
  } catch (error) {
    console.log(error)
  }
}
