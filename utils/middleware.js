const jwt = require('jsonwebtoken')


const getTokenFrom = (request, response, next) => {
    const authorization = request.get('authorization')
    if (authorization && authorization.startsWith('Bearer ')) {
      request.token = authorization.replace('Bearer ', '')
    } else
      request.token = null
    next()
  }

module.exports = {
    getTokenFrom
}