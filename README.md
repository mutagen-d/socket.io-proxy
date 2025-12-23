# Proxy server with socket.io tunneling

This is a proxy server that tunnels traffic through socket.io connections.
It has 2 parts: a local proxy server (handles socks & http) and a remote socket.io server (relays traffic).

## Setup

Edit `.env` file with your settings:
```bash
LOCAL_PROXY_PORT - local proxy port (for your machine)
REMOTE_SERVER_URL - remote socket.io server url (use https)
REMOTE_SERVER_PORT - remote server port
AUTH_TOKEN - token for socket.io authorization (keep it secret)
CERT - path to ssl certificate (optional)
PRIVATE_KEY - path to ssl private key (optional)
REJECT_UNAUTHORIZED - set to 'false' to allow self-signed certificates (default: 'true')
```

## Install

```bash
yarn
```

## Running

### Local machine (your computer)

Run the local proxy server

```bash
yarn local
# or
node src/local.js
# or
pm2 start src/local.js --name proxy-server
```

### Remote machine (server/VPS)

Run the socket.io server

```bash
yarn remote
# or
node src/remote.js
# or
pm2 start src/remote.js --name socket.io-server
```

## SSL Certificates

If you need SSL certificates for your remote server (for https), you can generate self-signed ones:

```bash
yarn gen-cert
# or
npm run gen-cert
```

This creates server.crt and private.key files in your current directory. Then set in .env:

```bash
CERT=./server.crt
PRIVATE_KEY=./private.key
REJECT_UNAUTHORIZED=false
```

## How it works

1. Local proxy runs on your machine
2. Remote socket.io server runs on your server
3. They connect through socket.io (websockets)
4. Your traffic goes: App → Local proxy → Socket.io tunnel → Remote server → Internet
5. Responses come back the same way

## Notes

- Make sure both servers are running
- Use https for REMOTE_SERVER_URL if possible
- Check your firewall settings on remote server
- Set the same AUTH_TOKEN on both sides for secure connections
- SSL certificates (CERT / PRIVATE_KEY) are only needed if you run https directly
- When using self-signed certificates, set REJECT_UNAUTHORIZED=false to avoid connection errors