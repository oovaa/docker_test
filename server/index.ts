import express, { json } from 'express'
import { RedisClient } from 'bun'
import cors from 'cors'

const port = Bun.env.PPORT || 3355
// Make Redis host/port configurable so containerized server can reach Redis
// from the host or other container. Set REDIS_HOST to one of:
// - 'localhost' (default when running on the host)
// - 'host.docker.internal' (Docker Desktop / Linux with host-gateway)
// - 'redis' (service name when using docker-compose)
const redis_host = Bun.env.REDIS_HOST || 'localhost'
const redis_port = Bun.env.REDIS_PORT || 6370
const redisUrl = `redis://${redis_host}:${redis_port}`
console.log('Connecting to Redis at', redisUrl)
const client = new RedisClient(redisUrl)
const app = express()

console.log(port)
console.log(redis_port)

// Add middleware to parse JSON bodies
app.use(json())
app.use(cors())

// Simple logging middleware
app.use(
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const start = Date.now()
    res.on('finish', () => {
      const duration = Date.now() - start
      console.log(
        `${new Date().toISOString()} ${req.method} ${req.originalUrl} ${
          res.statusCode
        } - ${duration}ms \n body ${JSON.stringify(req.body)}`
      )
    })
    next()
  }
)

app.get('/', (req, res) => {
  console.log("GET / - success")
  res.json({ stat: 'success' })
})

app.post('/getVal', async (req, res) => {
  try {
    const { key } = req.body
    if (!key) {
      console.warn("POST /getVal - missing key in request body")
      return res.status(400).json({ stat: 'error', message: 'Key is required' })
    }
    const val = await client.get(key)
    console.log(`POST /getVal - success - key=${key} val=${String(val)}`)
    res.json({ stat: 'success', data: val })
  } catch (error) {
    console.error('POST /getVal - failure - error:', error)
    res.status(500).json({ stat: 'error', message: 'Failed to get value' })
  }
})

app.post('/setVal', async (req, res) => {
  try {
    const { key, val } = req.body
    if (!key || val === undefined) {
      console.warn("POST /setVal - missing key or value", { key, val })
      return res
        .status(400)
        .json({ stat: 'error', message: 'Key and value are required' })
    }
    await client.set(key, val)
    console.log(`POST /setVal - success - key=${key} val=${String(val)}`)
    res.json({ status: 'success', data: { key, val } })
  } catch (error) {
    console.error('POST /setVal - failure - error:', error)
    res.status(500).json({ stat: 'error', message: 'Failed to set value' })
  }
})

app.get('/getall', async (req, res) => {
  try {
    const all = await client.keys('*')
    console.log(`GET /getall - success - keys_count=${all?.length ?? 0}`)
    res.json({ status: 'success', data: all })
  } catch (error) {
    console.error('GET /getall - failure - error:', error)
    res.status(500).json({ stat: 'error', message: 'Failed to get keys' })
  }
})

app.delete('/deleteV', async (req, res) => {
  try {
    const { key } = req.body
    if (!key) {
      console.warn("DELETE /deleteV - missing key in request body")
      return res.status(400).json({ stat: 'error', message: 'Key is required' })
    }

    const result = await client.del(key)
    if (result === 0) {
      console.warn(`DELETE /deleteV - key not found - key=${key}`)
      return res.status(404).json({ stat: 'error', message: 'Key not found' })
    }

    console.log(`DELETE /deleteV - success - key=${key}`)
    res.json({
      status: 'success',
      message: `Key '${key}' deleted successfully`,
    })
  } catch (error) {
    console.error('DELETE /deleteV - failure - error:', error)
    res.status(500).json({ stat: 'error', message: 'Failed to delete key' })
  }
})

// Optional: Add error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Unhandled error middleware -', err?.stack || err)
  res.status(500).json({ stat: 'error', message: 'Something went wrong!' })
})

// @ts-ignore
app.listen(port, '0.0.0.0', () => {
  console.log(
    `Example app listening on port ${port} (accessible from external connections)`
  )
})
