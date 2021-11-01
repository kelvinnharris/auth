require('dotenv').config()

const express = require('express')
const app = express()

const jwt = require('jsonwebtoken')

const Role = require('./role')

const posts = [
  {
    username: 'Admin',
    title: 'Admin\'s 1st post'
  },
  {
    username: 'Admin',
    title: 'Admin\'s 2nd post'
  },
  {
    username: 'User',
    title: 'User\'s 1st post'
  },
  {
    username: 'User',
    title: 'User\'s 2nd post'
  },
]

app.use(express.json())

app.get('/posts', authenticateToken, authorize([Role.Admin, Role.User]), (req, res) => {
  res.json(posts.filter(post => post.username === req.user.username))
})

app.get('/all-posts', authenticateToken, authorize([Role.Admin]), (req, res) => {
  res.json(posts)
})


function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token == null) return res.sendStatus(401); // not authorized

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(401).json({ message: 'Access token expired, please reauthenticate' })
    req.user = user // contains role
    next()
  })
}


function authorize(roles = []) {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return [
    (req, res, next) => {
      if (roles.length && !roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Role is unauthorized' })
      }
      next();
    }
  ];
}

app.listen(3000)