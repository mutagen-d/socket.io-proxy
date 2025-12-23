require('dotenv').config()
const { createProxyServer } = require('@mutagen-d/node-proxy-server')
const io = require('socket.io-client');
const ss = require('socket.io-stream')

const port = process.env.LOCAL_PROXY_PORT || 8010;
const time = () => new Date().toISOString();
const url = process.env.REMOTE_SERVER_URL || 'http://localhost:8011';
const authToken = process.env.AUTH_TOKEN;
if (!authToken) {
  throw new Error('Auth token required. Add AUTH_TOKEN to .env file')
}
/** @type {import('socket.io-client').Socket} */
const socket = io(url, {
  auth: { token: authToken }
})
socket.on('connect_error', (error) => {
  console.log(time(), 'connect_error', error.message)
})

const server = createProxyServer({
  createProxyConnection: async (options) => {
    const stream = ss.createStream()
    const defer = {};
    defer.promise = new Promise((resolve, reject) => {
      defer.resolve = resolve;
      defer.reject = reject;
    })
    ss(socket).emit('proxy-stream', stream, options, (err) => {
      err ? defer.reject(err) : defer.resolve()
    })
    await defer.promise
    return stream
  }
})

server.on('error', (error) => {
  console.log(time(), 'error', error)
})

server.listen(port, '0.0.0.0', () => console.log(time(), 'server listening port', port))