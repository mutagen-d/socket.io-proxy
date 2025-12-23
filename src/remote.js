require('dotenv').config()
const fs = require('fs')
const net = require('net')
const http = require('http')
const https = require('https')
const { Server } = require('socket.io');
const ss = require('socket.io-stream')

const port = process.env.REMOTE_SERVER_PORT || 8011;
const time = () => new Date().toISOString()

const cert = process.env.CERT
const key = process.env.PRIVATE_KEY
const HAS_CERT = (cert && key)
const server = HAS_CERT
  ? https.createServer({ cert: fs.readFileSync(cert), key: fs.readFileSync(key) })
  : http.createServer()
const io = new Server(server)

const authToken = process.env.AUTH_TOKEN
if (!authToken) {
  throw new Error('Auth token required. Add AUTH_TOKEN to .env file')
}
io.use((socket, next) => {
  const { auth } = socket.handshake;
  if (auth.token !== authToken) {
    next(new Error('unauthorized'))
  } else {
    next()
  }
})

io.on('connection', (socket) => {
  console.log(time(), 'connected', socket.id)
  ss(socket).on('proxy-stream', (stream, options, callback) => {
    const s = net.createConnection({ host: options.dstHost, port: options.dstPort })
    console.log(time(), 'PROXY', `${options.dstHost}:${options.dstPort}`)
    s.on('connect', () => callback())
    s.on('error', (error) => callback(error && (error.message || error)))
    s.pipe(stream).pipe(s)
  })
  const socketId = socket.id;
  socket.on('disconnect', (reason) => {
    console.log(time(), 'disconnected', socketId, { reason })
  })
})

server.listen(port, '0.0.0.0', () => console.log(time(), `${HAS_CERT ? '(ssl) ' : ''}server listening port`, port))
