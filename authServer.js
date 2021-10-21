require('dotenv').config()

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

app.use(express.json())

// Database of users and refreshTokens
let users = []

// Steps to authenticate with refresh tokens:
// 1. send API request with access token
// 2. If access token is invalid, try to update it using refresh token
// 3. if refresh request passes, update the access token and re-send the initial API request
// 4. If refresh request fails, ask user to re-authenticate
let refreshTokens = []

app.get('/users', (req, res) => {
  res.json(users)
})

app.get('/refresh_tokens', (req, res) => {
  res.json(refreshTokens)
})

app.post('/register', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10) // 10 rounds

    const user = {
      username: req.body.username,
      password: hashedPassword
    }

    users.push(user)
    res.status(201).send('Register successful')
  } catch {
    res.status(500).send('Register failed')
  }
})

const authenticate = async (req, res, next) => {
  const user = users.find(user => user.username == req.body.username)
  if (user == null) return res.status(400).send('Cannot find user')

  try {
    if (await bcrypt.compare(req.body.password, user.password)) {
      next()
    } else {
      res.status(403).send('Not authenticated')
    }
  } catch {
    res.status(500).send()
  }
}

app.post('/login', authenticate, (req, res) => {
  const username = req.body.username
  user = { username: username }
  const accessToken = generateAccessToken(user)
  const refreshToken = generateRefreshToken(user)

  refreshTokens.push(refreshToken)
  console.log(refreshTokens)

  res.json({ accessToken: accessToken, refreshToken: refreshToken })
})

app.delete('/logout', (req, res) => {
  refreshTokens = refreshTokens.filter(rt => rt !== req.body.token)
  console.log(refreshTokens)
  res.status(204).send('Logout successful')
})

// Use refreshToken to generate new accessToken
app.post('/token', (req, res) => {
  const refreshToken = req.body.token

  if (refreshToken == null) return res.sendStatus(401)

  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = generateAccessToken({ username: user.username });
    res.json({ accessToken: accessToken })
  })
})

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30s' })
}

function generateRefreshToken(user) {
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
}

app.listen(4000)