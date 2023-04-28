const NodeEnviroment = require('../../../config');
const app = require('../../app')
const http = require('http')
const { normalizePort, onError, onListening } = require('./server.utils')

const port = normalizePort(NodeEnviroment.PORT)
const server = http.createServer(app)

app.set('port', port)

server.listen(port)
server.on('error', (error) => onError(port, error))
server.on('listening', () => onListening(server, port))
