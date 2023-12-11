const express = require('express')
const path = require('path')
const bcrypt = require('bcrypt')
const app = express()

// setup static and middleware
app.use(express.static('./SWE363 Project/css'))
app.use(express.static('./SWE363 Project/fonts'))
app.use(express.static('./SWE363 Project/JS'))
app.use(express.static('./SWE363 Project/images'))
app.use(express.static('./SWE363 Project/html'))

app.use(express.urlencoded({ extended: false }))


app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, './SWE363 Project/html/index.html'))
})

app.get('/', (req, res) => {
  res.render('register.html')
})

app.post('/register.html', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    URLSearchParams.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    })
    res.redirect('/login.html')
  } catch {
    res.redirect('/register.html')
  }
  console.log
})

app.post('/login.html', (req, res) => {
  
})

app.all('*', (req, res) => {
  res.status(404).send('resource not found')
})

app.listen(3000, () => {
  console.log('server is listening on port 3000....')
})
