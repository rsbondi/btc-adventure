// this is a hard coded mess for now, to be cleaned up and expanded upon

const { Bitwriter, Bytes, Hash, Biterator } = require('./common.js')
const { Transaction }  = require('./transaction.js')

// const magic = Bytes.toHex([0xfa, 0xbf, 0xb5, 0xda]) // regtest
// const magic = Bytes.toHex([0xfd, 0xd2, 0xc8, 0xf1]) // litecoin testnet
const magic = Bytes.toHex([0x0B, 0x11, 0x09, 0x07]) // testnet

// const port = 18444 // regtest
// const port = 19335 // litecoin testnet
const port = 18333 // testnet

const peer = '192.168.0.132'
const myversion = 70002

function createHeader(command) {
    const header = new Bitwriter()
    header.write(magic)
    let cmd = []
    command.split('').forEach(c => cmd.push(c.charCodeAt(0)))
    for(let i=cmd.length; i<12;i++) cmd.push(0x00)
    header.write(Bytes.toHex(cmd))
    return header
}

function calccheck(data) { return Hash.datahash(data).slice(0, 8) }
   
const header = createHeader('version')
const message = new Bitwriter()
message.writeInt(myversion, 4)                                                // version
message.write(Bytes.toHex([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]))  // no services
message.writeInt((new Date()).getTime(), 8)                                   // time
message.write(Bytes.toHex([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,    // services again
                           0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                           0x00, 0x00, 0xFF, 0xFF].concat( 
                           peer                                               // recipient address
                           .split('.').map(m => parseInt(m, 10))).concat(
                           [0x48, 0x0c                                        // port 18444
                        ])))
message.write(Bytes.toHex([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,    // services again
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0xFF, 0xFF, 
                            192 , 168 , 0   , 23  ,                           // sender address
                            0x48, 0x0c                                        // port 18444
                         ]))
message.write(Bytes.toHex([0xDD, 0x9D, 0x20, 0x2C, 0x3A, 0xB4, 0x57, 0x13]))  // Node random unique ID ???
const subver = '/bondi:0.0.1/'.split('').reduce((o, c) => {
    o.push(c.charCodeAt(0)); return o},[])                                    // bytes from string
message.write(Bytes.toHex([subver.length]))                                   // "" sub-version string (string is x bytes long
message.write(Bytes.toHex(subver))  

message.writeInt(111, 4)                                                      // Last block sending node has is block

header.writeInt(message.getValue().length / 2, 4)
const check = Hash.datahash(message.getValue()).slice(0, 8)                   // checksum, 4 bytes of string
header.write(check)

const request = `${header.getValue()}${message.getValue()}`

console.log('request', request) 

var net = require('net');

var client = new net.Socket();
client.setEncoding('hex')

const handlers = {
    version: function(version) {
        clientrequest(magic + "76657261636B000000000000000000005DF6E0E2")
    },
    verack: function() {

    },
    ping: function(nonce) {
        const header = createHeader('pong')
        header.writeInt(8, 4)
        header.write(calccheck(nonce))
        header.write(nonce)
        clientrequest(header.getValue())
    },
    addr: function(msg) {
        const reader = new Biterator(msg)
        const naddr = reader.readVarInt()                         // number of addresses
        const timestamp = reader.readInt(4)
        console.log((new Date(timestamp*1000)).toString())
        for(let a=0; a<naddr; a++) {
            const services = reader.readBytes(8)
            console.log('services', services)
            const addr = reader.readBytes(16).slice(12).join('.') // TODO: ipv6
            const port = reader.readInt(2)
            console.log('address info:', addr, port)
        }
    },
    inv: function(list) {
        const invtypes = {ERROR: 0, MSG_TX: 1, MSG_BLOCK: 2, MSG_FILTERED_BLOCK: 3, MSG_CMPCT_BLOCK: 4}
        const reader = new Biterator(list)
        const ninv = reader.readVarInt()                          // number of addresses
        for(i=0; i<1; i++) {
            const invtype = reader.readInt(4)                     // one of invtypes
            const hash = Bytes.toHex(reader.readBytes(32))        // hash of block, tx, etc
            console.log('inv: type, hash', invtype, hash)
            if(invtype == invtypes.MSG_TX) {
                const header = createHeader('getdata')
                
                const msg = new Bitwriter()
                msg.writeVarInt(1)
                msg.writeInt(invtype, 4)
                msg.write(hash)
                
                header.writeInt(msg.getValue().length / 2, 4)
                header.write(calccheck(msg.getValue()))
                console.log('getdata', header.getValue()+msg.getValue())
                clientrequest(header.getValue()+msg.getValue())
            }
        }

        // Allows a node to advertise its knowledge of one or more objects. It can be received unsolicited, or in reply to getblocks.
    },
    getdata: function() {
        /*
        getdata is used in response to inv, to retrieve the content of a specific object, and is usually sent after receiving an inv packet, 
        after filtering known elements. It can be used to retrieve transactions, but only if they are in the memory pool or relay set - 
        arbitrary access to transactions in the chain is not allowed to avoid having clients start to depend on nodes having full 
        transaction indexes (which modern nodes do not).
        Payload (maximum 50,000 entries, which is just over 1.8 megabytes):

        Field Size	Description	Data type	Comments
        ?	        count	    var_int	    Number of inventory entries
        36x?	    inventory	inv_vect[]	Inventory vectors
        */
    },
    tx: function(tx) {
        console.log(JSON.stringify(Transaction.parseRaw(tx) , null, 2))
    }
}

function clientrequest(request) {    
    const buff = new Buffer(request, 'hex')
    client.write(buff);       
}

let some = ''
function datalistener(response) {
    some+=response
    const somes = some.split(magic)
    somes.forEach((r, i) => {
        if(r.length < 32) return
        const reader = new Biterator(r)
        const command = reader.readBytes(12)
        let cmd = command.reduce((o,c) => {
            if(c) o += String.fromCharCode(c)
            return o
        }, '')
        const len = reader.readInt(4)
        const check = reader.readBytes(4) // TODO: varify for integrety
        const rest = reader.getRemaining()

        if(len == rest.length) {
            cmddata = Bytes.toHex(rest)
            if(~Object.keys(handlers).indexOf(cmd)) handlers[cmd](cmddata)
            else console.log('not yet implemented', cmd, cmddata)
            some = somes.slice(i+1).join(magic)
        }
    })
}
client.on('data', datalistener);

client.on('end', () => {
    console.log('end')
});
client.on('error', (err) => {
        console.log('error', err)
});

function connect() {
    client.connect(port, peer, function() {
       console.log('Connected');
       clientrequest(request)
    });
}

connect()


client.on('close', function() {
   console.log('Connection closed');
});