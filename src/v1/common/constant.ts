export const ENDPOINT = 'http://localhost:3000/api/v1'

export const JWT_TOKEN_EXPIRATION = 60 * 60 * 24 //second
export const JWT_CONFIRM_CODE_EXPIRATION = 60 * 60 * 24 //second
export const JWT_HEADER_NAME = 'Authorization'

export const PAGE_SIZE = 3

export enum STATUS {
  SUCCESS = 'success',
  FAIL = 'fail',
  NOT_FOUND = 'data not found',
}

// export const STATUS = {
//   SUCCESS: 'success',
//   FAIL: 'fail',
//   NOT_FOUND: 'data not found',
// }

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

export const TARGET_UPLOAD = ['profile-image']

export const swaggerOptions = (dirname: string) => {
  return {
    definition: {
      openapi: '3.0.1',
      info: {
        title: 'REST API for Swagger Documentation',
        version: '1.0.0',
      },
      schemes: ['http', 'https'],
      servers: [{ url: 'http://localhost:3000/' }],
    },
    apis: [`${dirname}/routes/api/v1/adminV1Router.ts`],
  }
}
