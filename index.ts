import express from 'express'

const PORT = 4555

const app = express()

app.get('/', (req, res) => {
  res.json({ status: 'sucess' })
})

app.listen(PORT, () => {
  console.log(`app is runneing on localhost:${PORT}`)
})
