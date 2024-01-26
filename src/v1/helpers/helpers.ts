import mongoose from 'mongoose'

import { PAGE_SIZE, ROLE, ROLE_LEVEL } from '../common/constant'
import { IUser } from '../model/User'

export const isValidId = (_id: string): boolean => mongoose.Types.ObjectId.isValid(_id)

export const isValidEmail = (email: string): boolean =>
  /^[A-Za-z]([\.\+\_\w][\w]+)+@[a-z]\w+\.[a-z]+$/g.test(email || '')

export const isValidPassword = (pw: string): boolean => /.{6,}/g.test(pw || '')

export const isValidRole = (role: string): boolean => Object.keys(ROLE).includes(role)

export const isValidFormRegister = ({ email, password, name, birthDate }: IUser) => {
  return isValidEmail(email) || isValidPassword(password)
}

export const formatRedisBlackListTokenKey = (token: any, userId: any) => {
  return `inactive-token-${userId}-${token}`
}

export const formatRedisActiveTokenKey = (token: string, userId: any) => {
  return `active-token-${userId}-${token}`
}

export const formatToken = (token: string) => {
  return `Bearer ${token}`
}

export const getTokenFromHeader = (token: string) => {
  return (token || '').replace('Bearer ', '')
}

export const getPageCursor = (currentPage: any) => {
  currentPage = !!parseInt(currentPage) ? parseInt(currentPage) : 1
  const start = currentPage * PAGE_SIZE <= PAGE_SIZE ? 1 : PAGE_SIZE * (currentPage - 1) + 1
  const end = start + PAGE_SIZE - 1
  return { start, end }
}
