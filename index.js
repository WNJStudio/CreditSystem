//utilities
const path = require('path');
//webserver modules
const express = require('express')
const app = express()
const http = require('http').createServer(app)
//socket module
const io = require('socket.io')(http)
//multithreading for python crawler
const spawn = require('child_process').spawn;
let crawler
const startCrawler = rid =>{
  if(!crawler){
    crawler = spawn('python3',['crawler.py',rid],{detached:true})
    console.log('Crawler running')
  }else{
    console.log('Crawler already running')
  }
}
const stopCrawler = ()=>{
  if(!crawler){
    console.log('Crawler not running')
  }else{
    crawler.kill()
    crawler = null
    console.log('Killed Crawler')
  }
}
//crawler data handling
const handleCrawlerData = handler =>{
  if(crawler){
    crawler.stdout.on('data',handler)
    console.log('Listening for data')
  }else{
    console.log('Crawler not running')
  }
}
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
