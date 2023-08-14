require('./app')
const app = require('./app')
const http = require('http')
const server = http.createServer(app)

const config = require('./utils/config')
server.listen(config.PORT, () => {
    logger.info(`Server is running on port ${config.PORT}`)
  })