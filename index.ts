import { redis, RedisClient } from 'bun'

// Using the default client (reads connection info from environment)
// process.env.REDIS_URL is used by default
await redis.set('hello', 'world')
const result = await redis.get('hello')

// Creating a custom client
const client = new RedisClient('redis://omar:1@localhost:6370')
await client.set('counter', '0')
await client.incr('counter')

console.log(await client.get('counter'), result)
