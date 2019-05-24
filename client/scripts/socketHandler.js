const socket = io()
function run(){
  socket.emit('run')
}
function stop(){
  socket.emit('stop')
}

socket.on('data',data=>console.log(data))
