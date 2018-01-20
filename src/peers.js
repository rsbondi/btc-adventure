// this is a hard coded mess for now, to be cleaned up and expanded upon

const { Bitwriter, Bytes, Hash, Biterator } = require('./common.js')

// const magic = Bytes.toHex([0xda, 0x85, 0xbf, 0xab]) // regtest
const magic = Bytes.toHex([0x0B, 0x11, 0x09, 0x07]) // testnet

// const port = 18444 // regtest
const port = 18333 // testnet

const peer = '192.168.0.132'

function createHeader(command) {
  const header = new Bitwriter()
  header.write(magic)
  let cmd = []
  command.split('').forEach(c => cmd.push(c.charCodeAt(0)))
  for (let i = cmd.length; i < 12; i++) cmd.push(0x00)
  header.write(Bytes.toHex(cmd))
  return header
}

function calccheck(data) { return Hash.datahash(data).slice(0, 8) }

const header = createHeader('version')
const message = new Bitwriter()
message.write(Bytes.toHex([0x62, 0xEA, 0x00, 0x00]))                         // version
message.write(Bytes.toHex([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])) // no services
message.writeInt((new Date()).getTime(), 8)                                  // time
message.write(Bytes.toHex([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,   // services again
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0xFF, 0xFF].concat(
  peer                                   // recipient address
    .split('.').map(m => parseInt(m, 10))).concat(
  [0x48, 0x0c                                        // port 18444
  ])))
message.write(Bytes.toHex([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,   // services again
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0xFF, 0xFF,
  192, 168, 0, 23,                           // sender address
  0x48, 0x0c                                        // port 18444
]))
message.write(Bytes.toHex([0xDD, 0x9D, 0x20, 0x2C, 0x3A, 0xB4, 0x57, 0x13]))  // Node random unique ID ???
message.write(Bytes.toHex([0x00]))                                            // "" sub-version string (string is 0 bytes long
message.write(Bytes.toHex([0x0F, 0x2F, 0x53, 0x61, 0x74, 0x6F, 0x73, 0x68, 0x69, 0x3A, 0x30, 0x2E, 0x37, 0x2E, 0x32, 0x2F]))                            // "/Satoshi:0.7.2/" sub-version string (string is 15 bytes long)

message.writeInt(111, 4)                                                      // Last block sending node has is block

header.writeInt(message.getValue().length / 2, 4)
const check = Hash.datahash(message.getValue()).slice(0, 8) // 4 bytes of string
header.write(check)

const request = `${header.getValue()}${message.getValue()}`

console.log('request', request)

var net = require('net');

var client = new net.Socket();
client.setEncoding('hex')

const handlers = {
  version: function (version) {
    console.log('handle version data')
    clientrequest(magic + "76657261636B000000000000000000005DF6E0E2")
  },
  verack: function () {

  },
  ping: function (nonce) {
    const header = createHeader('pong')
    header.writeInt(8, 4)
    header.write(calccheck(nonce))
    header.write(nonce)
    console.log('pong', header.getValue())
    clientrequest(header.getValue())
  },
  addr: function () {

  },
  inv: function () {

  }
}

function clientrequest(request) {
  let some = ''
  let commands = []
  client.on('data', function (response) {
    some += response
    some.split(magic).forEach(r => {
      if (r.length < 32) return
      const reader = new Biterator(r)
      const command = reader.readBytes(12)
      let cmd = command.reduce((o, c) => {
        if (c) o += String.fromCharCode(c)
        return o
      }, '')
      const len = reader.readInt(4)
      const check = reader.readBytes(4)
      const rest = reader.getRemaining()

      if (len == rest.length && !~commands.indexOf(cmd)) {
        cmddata = Bytes.toHex(rest)
        console.log('command', cmd)
        // console.log('data', cmddata)
        commands.push(cmd)
        if (~Object.keys(handlers).indexOf(cmd)) handlers[cmd](cmddata)
      }
    })
  });

  client.on('end', () => {
    console.log('end')
  });
  client.on('error', (err) => {
    console.log('error', err)
  });
  const buff = new Buffer(request, 'hex')
  client.write(buff);
}

function connect() {
  client.connect(port, peer, function () {
    console.log('Connected');
    clientrequest(request)
  });
}

connect()


client.on('close', function () {
  console.log('Connection closed');
});