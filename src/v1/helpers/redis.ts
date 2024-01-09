import { SetOptions, createClient } from 'redis'

const client = createClient({
  password: 'epwvevYuIAzGrVMahHcHDCkkgWh9vTOP', //process.env.REDIS_PASSWORD
  socket: {
    host: 'redis-14152.c302.asia-northeast1-1.gce.cloud.redislabs.com', //process.env.REDIS_URI
    port: 14152,
  },
})

export const setRedisValue = async (key: string, value: string, option = {}) => {
  if (!key || !value) return

  try {
    await client.connect()
  } catch (error) {
    // console.log('connect redis', error)
  }
  return await client.set(key, value, option)
}

export const getRedisValue = async (key: string) => {
  if (!key) return

  try {
    await client.connect()
  } catch (error) {
    // console.log('connect redis', error)
  }
  return await client.get(key)
}

export const removeRedisValue = async (key: string) => {
  if (!key) return

  try {
    await client.connect()
  } catch (error) {
    // console.log('connect redis', error)
  }
  return await client.del(key)
}

export const renameRedisKey = async (key: string, newKey: string) => {
  if (!key) return

  try {
    await client.connect()
  } catch (error) {
    // console.log('connect redis', error)
  }
  return await client.rename(key, newKey)
}

export const getRedisActiveKeyByUserId = async (userId: any) => {
  if (!userId) return

  try {
    await client.connect()
  } catch (error) {
    // console.log('connect redis', error)
  }
  return await client.keys(`active-token-${userId}*`)
}
