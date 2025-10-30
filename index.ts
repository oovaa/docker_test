import { file } from 'bun'
import express from 'express'

const PORT = 4555

const app = express()

app.get('/', (req, res) => {
  res.json({
    status: 'sucess',
    data: `app is runneing on localhost:${PORT} env var is ${Bun.env.BBB} and test is ${Bun.env.test}`,
  })
})

app.listen(PORT, () => {
  console.log(
    `app is runneing on localhost:${PORT} env var is ${Bun.env.BBB} and test is ${Bun.env.test}`
  )
})

app.post('/', async (req, res) => {
  await Bun.write('.env', 'BBB=HAHAH')
  res.send('written successfully')
})
