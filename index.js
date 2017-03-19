const lowdb = require('lowdb')
const {User} = require('aram-ranked')
const express = require('express')

const db = lowdb('db.json')
const app = express()

db.defaults({
  users: [],
  history: []
}).write()

app.get('/getUserByName', function (req, res) {
  if (!checkRequestParams(req, ['server', 'username'], res)) return
  let user = db.get('users').find({ username: req.query.username }).value()
  if (!user) {
    new User(req.query.server, req.query.username).then(user => {
      res.send(JSON.stringify(user, null, 2))
    })
  }
})

app.get('/getUserById', function (req, res) {
  if (!checkRequestParams(req, {name: 'id', type: Number}, res)) return
  let user = db.get('users').find({ id: req.params.id }).value()
  res.send(user)
})

app.listen(3000)

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
  res.send(400, `Error${errors.length > 1 ? 's' : ''} :
${errors.join('\n')}`)
  return false
}
