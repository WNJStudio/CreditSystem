//utilities
const path = require('path');
//webserver modules
const express = require('express')
const app = express()
const http = require('http').createServer(app)
//socket module
const io = require('socket.io')(http)
// TODO: child processes with python
//linking static files
app.use(express.static(path.resolve(__dirname,'client')))
//webpage routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname,'client','index.html'))
})
//socket events routing
io.on('connection', socket => {
  console.log('a user connected')
})

//server listening
http.listen(3000, () => {
  console.log('listening on *=3000')
})
