//utilities
const path = require('path');
//webserver modules
const express = require('express')
const app = express()
const http = require('http').createServer(app)
//socket module
const io = require('socket.io')(http)
//axios
const axios = require('axios')
//net for crawling
const net = require('net')
const HOST = '119.96.201.28'
const PORT = 8601
//Crawling
//Data utilyties
const dataToMsg = data => {
  return Object.entries(data).reduce((acc, curr) => {
    return acc + `${curr[0]}@=${curr[1]}/`
  }, '')
}
const msgToData = msg => {
  let r = {}
  for (let c of msg.matchAll(/(.+?)@=(.*?)\//g)) {
    r[c[1]] = c[2]
  }
  return r
}
//Send data
const send = (socket, payload) => {
  console.log(`Sending:${payload}`)
  let data = Buffer.alloc(12 + payload.length + 1)
  data.writeInt32LE(4 + 4 + payload.length + 1, 0)
  data.writeInt32LE(4 + 4 + payload.length + 1, 4)
  data.writeInt32LE(0x000002b1, 8)
  data.write(payload, 12)
  data.writeInt8(0, 4 + 4 + 4 + payload.length)
  socket.write(data)
}
//Data handling
const accepted = ['uenter', 'chatmsg', 'dgb']
const reject = ['frank', 'lgspeacsite', 'rri', 'fswrank', 'loginres', 'noble_num_info', 'keeplive', 'anbc', 'lgpdtmsg', 'lucky_active', 'qausrespond', 'rnewbc', 'synexp']
let crawler
let keeplive
const startCrawler = roomid => {
  if (crawler) {
    console.log('Crawler already running')
  } else {
    crawler = net.connect(PORT, HOST, () => {
      console.log('Connected')
      send(crawler, dataToMsg({
        'type': 'loginreq',
        'roomid': roomid
      }))
      send(crawler, dataToMsg({
        'type': 'joingroup',
        'rid': roomid,
        'gid': '-9999'
      }))
    })
    keeplive = setInterval(() => send(crawler, dataToMsg({
      'type': 'keeplive',
      'tick': Date.now()
    })), 50000)
    crawler.on('data', data => {
      data = msgToData(data.toString('utf-8', 12))
      if (!reject.includes(data['type']))
        io.emit('data', data)
    })
  }
}
const stopCrawler = () => {
  if (crawler) {
    clearInterval(keeplive)
    crawler.end()
    crawler = null
  } else {
    console.log('Crawler not running')
  }
}
// data
//https://webconf.douyucdn.cn/resource/common/prop_gift_list/prop_gift_config.json
//https://www.douyu.com/betard/4340108
//https://webconf.douyucdn.cn/resource/common/gift/gift_template/20003.json
let rid
let noble_info = {}
const cleanNoble = data => {
  Object.entries(data).forEach(e => noble_info[e[0]] = `https://res.douyucdn.cn/resource/${e[1].symbol.web_symbol_pic1}`)
}
let gift_template = {}
const cleanGtemp = data => {
  Object.values(data).forEach(e => gift_template[e.id] = {
    icon: e.pc_full_icon,
    name: e.name,
    price: e.pc
  })
}
const cleanGifts = data => {
  Object.entries(data).forEach(e => gift_template[e[0]] = {
    icon: e[1].pc_full_icon,
    name: e[1].name,
    price: e[1].pc
  })
}
//linking static files
app.use(express.static(path.resolve(__dirname, 'client')))
//webpage routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'index.html'))
})
//socket events routing
io.on('connection', socket => {
  console.log('a user connected')
  socket.on('run', roomid => {
    startCrawler(roomid)
    rid = roomid
    axios.get(`https://www.douyu.com/betard/${roomid}`)
      .then(res => {
        cleanNoble(res.data.room.nobleConfig)
        io.emit('data', noble_info)
        axios.get(`https://webconf.douyucdn.cn/resource/common/gift/gift_template/${res.data.room.giftTempId}.json`)
          .then(gg => {
            cleanGtemp(JSON.parse(gg.data.match(/(?<=DYConfigCallback\()(.*)(?=\))/g)[0]).data)
            axios.get('https://webconf.douyucdn.cn/resource/common/prop_gift_list/prop_gift_config.json')
              .then(res => {
                cleanGifts(JSON.parse(res.data.match(/(?<=DYConfigCallback\()(.*)(?=\))/g)[0]).data)
                io.emit('data', gift_template)
              })
          })
      }).catch(err => console.error(err))

  })
  socket.on('stop', () => stopCrawler())
})
//server listening
http.listen(3000, () => {
  console.log('listening on *=3000')
})
