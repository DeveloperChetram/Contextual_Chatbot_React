const app = require('./src/app')
const httpServer = require('http').createServer(app)
const connectDB = require('./src/db/db')
const initSocketServer = require('./src/sockets/socket.server')

connectDB()
initSocketServer(httpServer)
const PORT = process.env.PORT || 3001
httpServer.listen(PORT,()=>{
    console.log(`server is running at http://localhost:${PORT}/`)
})

