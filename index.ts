import { file } from 'bun'
import express from 'express'

const PORT = 4555

const app = express()

app.get('/', (req, res) => {
  res.json({ status: 'sucess' })
})

app.listen(PORT, () => {
  console.log(`app is runneing on localhost:${PORT} env var is ${Bun.env.BBB}`)
})

app.post('/', (req, res) => {
  Bun.write('.env', 'BBB=HAHAH')
  res.send('written successfully')
})
