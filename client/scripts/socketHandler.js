const socket = io()
let nobleConfig
let giftConfig
function run(rid) {
  socket.emit('run', rid)
}

function stop() {
  socket.emit('stop')
}
socket.on('nobleconfig',data=>nobleConfig=data)
socket.on('giftconfig',data=>giftConfig=data)
socket.on('data', data => console.log(data))
socket.on('chat',data=>console.log(`${data.nn}:${data.txt}`))
socket.on('gift',data=>console.log(`${data.nn}:${giftConfig[data.gfid].name}x${data.gfcnt}`))
socket.on('welcome',data=>console.log(`Welcome ${data.nn}`))
