import { RedisClient } from 'bun'

const client = new RedisClient('redis://localhost:6370')

console.log(await client.set('tata', 'haha'))

console.log(await client.get('tata'))
