import session from 'express-session'
import connectRedis from 'connect-redis'
import redis from 'redis'

const RedisStore = connectRedis(session)
const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  }
})

redisClient.connect().catch(console.error)

redisClient.on('error', (err) => {
  console.error('Redis connection error:', err)
})

redisClient.on('connect', () => {
  console.log('Connected to Redis--------------------------------------')
})

// Session options object for Redis session store
export const sessionOptions = {
  store: new RedisStore({ client: redisClient }),
  name: process.env.SESSION_NAME || 'session', // Custom session cookie name
  secret: process.env.SESSION_SECRET || 'secret123', // Use a secure secret for HMAC
  resave: false, // Avoid resaving session if unmodified
  saveUninitialized: false, // Only save sessions when they are modified
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // Session max age of 1 day
    sameSite: 'strict', // Only allow cookies to be sent from the same site
    secure: process.env.NODE_ENV === 'production' // Serve cookies securely in production
  }
}
