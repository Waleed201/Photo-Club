if (process.env.NODE_Env !== 'production'){
  require('dotenv').config()
}

const express = require('express')
const path = require('path')
const bcrypt = require('bcrypt')
const app = express()
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const initializPassport = require('./passport-config.js')
initializPassport(
  passport, 
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
  )

const users = []


// setup static and middleware
app.use(express.static('./SWE363 Project/css'))
app.use(express.static('./SWE363 Project/fonts'))
app.use(express.static('./SWE363 Project/JS'))
app.use(express.static('./SWE363 Project/images'))
app.use(express.static('./SWE363 Project/html'))

app.use(express.urlencoded({ extended: false }))
app.set('view-engine', 'ejs')
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.get('/', checkAuthenticated, (req, res) => {
  res.sendFile(path.resolve(__dirname, './SWE363 Project/html/index.html'))
})

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs')
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    })
    res.redirect('/login')
  } catch {
    res.redirect('/register')
  }
  console.log(users)
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs')
})

app.all('*', (req, res) => {
  res.status(404).send('resource not found')
})

app.delete('/logout', (req, res) => {
  req.logOut()
  res.redirect('/login')
})

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}

app.listen(3000, () => {
  console.log('server is listening on port 3000....')
})
