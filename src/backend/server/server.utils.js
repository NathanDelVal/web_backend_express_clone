/* eslint-disable no-console */
const debug = require('debug')('victor:server')
const { networkInterfaces } = require('os')

const normalizePort = (val) => {
  const port = parseInt(val, 10)

  if (Number.isNaN(port)) return val
  if (port >= 0) return port

  return false
}

const getServerNetworkInfo=()=>{
  const results = Object.create(null)
  const nets = networkInterfaces()
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        if (net.family === 'IPv4' && !net.internal) {
          if (!results[name]) {
            results[name] = []
          }
          results.LocalIp = net.address
          results[name].push(net.address)
        }
      }
    }
    return results
}

const onListening = (server, port) => {
  const addr = server.address()
  const networkInfo = getServerNetworkInfo()

  const bind = typeof addr === 'string'
    ? `pipe ${addr}`
    : `port ${addr.port}`

  debug(`Listening on ${bind}`)
  console.log(`APP --> Express Server http://${networkInfo.LocalIp}:${port} ✔️`)
}

const onError = (port, error) => {
  if (error.syscall !== 'listen') {
    throw error
  }

  const bind = typeof port === 'string'
    ? `Pipe ${port}`
    : `Port ${port}`

  switch (error.code) {
  case 'EACCES':
    console.error(`${bind} requer privilegio maior`)
    process.exit(1)
    break

  case 'EADDRINUSE':
    console.error(`${bind} já está em uso`)
    process.exit(1)
    break

  default:
    throw error
  }
}

module.exports = {
  normalizePort,
  onListening,
  onError,
}

/*
    ServerVar.httpOrigin = `${'http://' + results.LocalIp + ':' + port}`
    ServerVar.httpOriginPort = port
    ServerVar.host = 'http://' + results.LocalIp + ':' + port + ''
*/
