require('dotenv').config()

const express = require('express')
const app = express()

const jwt = require('jsonwebtoken')

const posts = [
  {
    username: 'Kyle',
    title: 'Kyle\'s 1st post'
  },
  {
    username: 'Kyle',
    title: 'Kyle\'s 2nd post'
  },
  {
    username: 'Jim',
    title: 'Jim\'s 1st post'
  },
  {
    username: 'Jim',
    title: 'Jim\'s 2nd post'
  }
]

app.use(express.json())

app.get('/posts', authenticateToken, (req, res) => {
  console.log('/posts')
  console.log(req.user)
  res.json(posts.filter(post => post.username === req.user.username))
})

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token == null) return res.sendStatus(401); // not authorized

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  })
}

app.listen(3000)