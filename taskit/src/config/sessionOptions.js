/**
 * @file This module contains the options object for the session middleware.
 * @module config/mongoose
 * @author Anna Manole
 * @version 1.0.0
 * @see {@link https://github.com/expressjs/session}
 */

import RedisStore from 'connect-redis'
import redis from 'redis'
import { logger } from './winston.js'

const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  }
})

redisClient.connect().catch((err) => logger.error('Redis connection error:', err))

redisClient.on('connect', () => {
  logger.info('Connected to Redis successfully')
})

redisClient.on('ready', () => {
  logger.info('Redis client is ready to use')
})

export const sessionOptions = {
  store: new RedisStore({ client: redisClient }), // Use `new` with RedisStore
  name: process.env.SESSION_NAME || 'session', // Custom session cookie name
  secret: process.env.SESSION_SECRET || 'secret123', // Use a secure secret for HMAC
  resave: false, // Avoid resaving session if unmodified
  saveUninitialized: false, // Only save sessions when they are modified
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    sameSite: 'strict', // Only allow cookies to be sent from the same site
    secure: process.env.NODE_ENV === 'production' // Serve cookies securely in production
  }
}
