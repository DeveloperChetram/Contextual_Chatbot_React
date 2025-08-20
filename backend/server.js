const app = require('./src/app')
const httpServer = require('http').createServer(app)
const connectDB = require('./src/db/db')
const initSocketServer = require('./src/sockets/socket.server')

connectDB()
initSocketServer(httpServer)
httpServer.listen(3000,()=>{
    console.log('server is running at http://localhost:3000/')
})

