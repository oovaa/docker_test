import express, { json } from 'express'
import { RedisClient } from 'bun'
import cors from 'cors'

const port = Bun.env.PPORT || 3355
const redis_port = Bun.env.REDIS_PORT || 6379
const client = new RedisClient(`redis://localhost:${redis_port}`)
const app = express()

// Add middleware to parse JSON bodiesg
app.use(json())
app.use(cors())

app.get('/', (req, res) => {
  res.json({ stat: 'success' })
})

app.post('/getVal', async (req, res) => {
  try {
    const { key } = req.body
    if (!key) {
      return res.status(400).json({ stat: 'error', message: 'Key is required' })
    }
    const val = await client.get(key)
    res.json({ stat: 'success', data: val })
  } catch (error) {
    res.status(500).json({ stat: 'error', message: 'Failed to get value' })
  }
})

app.post('/setVal', async (req, res) => {
  try {
    const { key, val } = req.body
    if (!key || val === undefined) {
      return res
        .status(400)
        .json({ stat: 'error', message: 'Key and value are required' })
    }
    await client.set(key, val)
    res.json({ status: 'success', data: { key, val } })
  } catch (error) {
    res.status(500).json({ stat: 'error', message: 'Failed to set value' })
  }
})

app.get('/getall', async (req, res) => {
  try {
    const all = await client.keys('*')
    res.json({ status: 'success', data: all })
  } catch (error) {
    res.status(500).json({ stat: 'error', message: 'Failed to get keys' })
  }
})

app.delete('/deleteV', async (req, res) => {
  try {
    const { key } = req.body
    if (!key) {
      return res.status(400).json({ stat: 'error', message: 'Key is required' })
    }

    const result = await client.del(key)
    if (result === 0) {
      return res.status(404).json({ stat: 'error', message: 'Key not found' })
    }

    res.json({
      status: 'success',
      message: `Key '${key}' deleted successfully`,
    })
  } catch (error) {
    res.status(500).json({ stat: 'error', message: 'Failed to delete key' })
  }
})

// Optional: Add error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack)
  res.status(500).json({ stat: 'error', message: 'Something went wrong!' })
})

// @ts-ignore
app.listen(port, '0.0.0.0', () => {
  console.log(
    `Example app listening on port ${port} (accessible from external connections)`
  )
})
