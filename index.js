const lowdb = require('lowdb')
const {User} = require('aram-ranked')
const express = require('express')

const db = lowdb('db.json')
const app = express()
const q = []

db.defaults({
  users: [],
  history: []
}).write()

setTimeout(() => {
  const task = q.shift()
  if (!task) return
}, 1000)

setTimeout(() => {
  db.get('users').value().forEach(user => {
    const userId = +user.summonerId
    debugger
  })
}, 1000 * 60 * 3)

app.get('/getUser', function (req, res) {
  res.setHeader('Content-Type', 'application/json')
  if (!checkRequestParams(req, ['server'], res)) return

  if (!req.query.name && !req.query.id) {
    res.send(400, 'Missing parameter : name or id required')
    return
  }

  if (req.query.name) {
    if (!checkRequestParams(req, ['name'], res)) return
    let user = db.get('users').value().find(user => {
      return normalizeUsername(user.username) === normalizeUsername(req.query.name)
    })
    if (!user) {
      new User(req.query.server, req.query.name).then(user => {
        db.get('users').push(user).write()
        res.send(JSON.stringify(user))
      })
    } else {
      res.send(JSON.stringify(user))
    }
    return
  }

  if (req.query.id) {
    if (!checkRequestParams(req, {name: 'id', type: Number}, res)) return
    let user = db.get('users').value().find(user => +user.id === +req.query.id)
    if (!user) {
      new User(req.query.server, req.query.username).then(user => {
        db.get('users').push(user).write()
        res.send(JSON.stringify(user))
      })
    } else {
      res.send(JSON.stringify(user))
    }
  }
})

app.listen(3000)

function normalizeUsername (username) {
  if (!username) return ''
  return username.toLowerCase().replace(/\s/g, '')
}

function checkRequestParams (req, requiredParams, res) {
  if (typeof requiredParams === 'string') {
    if (!req.query[requiredParams]) {
      res.send(400, `Missing Parameter : ${requiredParams}`)
      return false
    }
    return true
  }
  const errors = []
  if (Array.isArray(requiredParams)) {
    requiredParams.forEach(requiredParam => {
      if (!req.query[requiredParam]) {
        errors.push(`Missing Parameter : ${requiredParam}`)
      }
    })
  } else {
    if (!req.query[requiredParams.name]) {
      errors.push(`Missing Parameter : ${requiredParams.name}`)
    }

    if (requiredParams.type === Number && typeof +req.query[requiredParams.name] !== 'number') {
      errors.push(`Parameter '${requiredParams.name}' must be a ${requiredParams.type}`)
    }
  }
  if (!errors.length) return true
  res.setHeader('Content-Type', 'text/plain')
  res.send(400, `Error${errors.length > 1 ? 's' : ''} :
${errors.join('\n')}`)
  return false
}
