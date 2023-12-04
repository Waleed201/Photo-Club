const express = require('express')
const path = require('path')

const app = express()

// setup static and middleware
app.use(express.static('./SWE363 Project/public'))

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, './SWE363 Project/html/index.html'))
})

app.all('*', (req, res) => {
  res.status(404).send('resource not found')
})

app.listen(3000, () => {
  console.log('server is listening on port 3000....')
})