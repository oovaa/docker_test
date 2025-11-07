import { redis, RedisClient } from 'bun'

// Change FROM this (with authentication):
// const client = new RedisClient('redis://omar:1@localhost:6370')

// TO this (no authentication):
const client = new RedisClient('redis://localhost:6370')

await client.set('counter', '0')
await client.incr('counter')
console.log(await client.get('counter'))
