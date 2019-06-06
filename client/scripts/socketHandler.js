const socket = io()

function run(rid) {
  socket.emit('run', rid)
}

function stop() {
  socket.emit('stop')
}

socket.on('data', data => console.log(data))
