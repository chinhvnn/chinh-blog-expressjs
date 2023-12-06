export const JWT_EXPIRATION = 60 * 60 * 24 //second
export const JWT_HEADER_NAME = 'Authorization'

export const PAGE_SIZE = 3

export const STATUS = {
  SUCCESS: 'success',
  FAIL: 'fail',
  NOT_FOUND: 'data not found',
}

export const REDIS_RESULT = {
  OK: 'OK',
}

export const ROLE = {
  USER: 'user',
  LEADER: 'leader',
  ADMIN: 'admin',
}

export const ROLE_LEVEL = {
  ADMIN: [ROLE.ADMIN, ROLE.LEADER, ROLE.USER],
  LEADER: [ROLE.ADMIN, ROLE.LEADER],
}
