import { redis, RedisClient } from 'bun'

// Using the default client (reads connection info from environment)
// process.env.REDIS_URL is used by default

// Creating a custom client
const client = new RedisClient('redis://localhost:6370')

await client.set('hello', 'world')
const result = await client.get('hello')
await client.set('counter', '0')
await client.incr('counter')

console.log(await client.get('counter'), result)
console.log(await client.get('tata'))
