# Communicating with peers on the network

Peer communication is done via a TCP connection, starting with handshaking.  Before that we need to find a peer to connect to.  I started connecting with my own node, this is recommended if possible.  By using your own node, you can see the results, if you are properly sending your user agent, services, block info, pong response etc.  You can also see the list of peers connected to your node to try connecting to other nodes.  If you don't have a node available, you can connect to a known node.  You can get a list from various dns seeds, these are hard coded into the reference client, and can be found [here](https://github.com/bitcoin/bitcoin/blob/master/src/chainparams.cpp#L128:9).  From a command prompt you can run `nslookup seedaddress` where `seedaddres` is one of the addresses coded in the link above.  This command will give you a list of nodes to try to get started.

## Handshaking

Handshaking is required to connect to a peer, it starts with the `version` command which tells a node basic info about your client, the node will respond with a `verack` command, short for "version acknowledgement".

### Sending commands

All commands follow the basic format of a `header` followed by a `message`

#### header

The header message follows the same format for all commands

|section|size(bytes)|description|
|-------|-----------|-----------|
|magic bytes|4|this is an identifier as to which network you are on, and also acts as a seperater between commands being sent|
|command|12|hex representation of the command text|
|msessage length| varies | the length of the message being sent|
|checksum|4|the first 4 bytes of double sha256 of the message|

#### messages

Each message has its own format, see [here](https://en.bitcoin.it/wiki/Protocol_documentation#Message_types) for message formats

### Creating a command

We know we need the `header` and `message`, the first two sections of the header we can create immediately, the checksum and size will be added to the `header` once the `message` creation is complete

In code it starts out like this, with the magic bytes and command

```javascript
function createHeader(command) {
    const header = new Bitwriter()
    header.write(magic)
    let cmd = []
    command.split('').forEach(c => cmd.push(c.charCodeAt(0)))
    for(let i=cmd.length; i<12;i++) cmd.push(0x00)
    header.write(Bytes.toHex(cmd))
    return header
}
```

The `command` is split into characters and converted to bytes, then padded to complete the 12 bytes

Then you create the `message` which is the body of the data you want to send, see [code](../src/peers.js) for examples.

The length of the message requires no special function, since we can just get that from our `Bitwriter`

`header.writeInt(message.getValue().length / 2, 4)` note divide by 2, 2 characters per byte

And calculate the checksum with the following

```javascript
function calccheck(data) { return Hash.datahash(data).slice(0, 8) }
```

Note again 2 characters per byte so we slice 8 to get the 4 bytes required for the checksum

### responding to commands

```javascript
let some = ''
let commands = []
client.on('data', function (response) {
    some+=response
    some.split(magic).forEach(r => {
        if(r.length < 32) return
        const reader = new Biterator(r)
        const command = reader.readBytes(12)
        let cmd = command.reduce((o,c) => {
            if(c) o += String.fromCharCode(c)
            return o
        }, '')
        const len = reader.readInt(4)
        const check = reader.readBytes(4) // TODO: verify for integrety
        const rest = reader.getRemaining()

        if(len == rest.length && !~commands.indexOf(cmd)) {
            cmddata = Bytes.toHex(rest)
            console.log('command', cmd)
            commands.push(cmd)
            if(~Object.keys(handlers).indexOf(cmd)) handlers[cmd](cmddata)
        }
    })
});
```

Data is not returned in coomplete form and you may recieve multiple responses in the stream.

We handle this by building a string. `some`, and adding to it on each `data` event. We then split by `magic` since there may be multiple commands in the stream.  We know our header is 32 bytes, so if we have 32 bytes for a command as we loop through, we can determin the size(`len`) of the message.  Knowing the size, we know when we have a complete message

```javascript
if(len == rest.length && !~commands.indexOf(cmd))
```

We keep track of completed `commands` so we only respond once, remember we are adding to the same string and splitting

If we have a handler for a command we call it

```javascript
if(~Object.keys(handlers).indexOf(cmd)) handlers[cmd](cmddata)
```

and the handlers look like this:

```javascript
const handlers = {
    version: function(version) {
        clientrequest(magic + "76657261636B000000000000000000005DF6E0E2")
    },
    verack: function() {
      ...
    },
    ping: function(nonce) {
        const header = createHeader('pong')
        header.writeInt(8, 4)
        header.write(calccheck(nonce))
        header.write(nonce)
        clientrequest(header.getValue())
    },
    addr: function(msg) {
      ...
    },
    inv: function() {
      ...
    }
    ...
}
```

A few simple examples are shown here, the `version` responds with `verack`, it is hard coded since we know the size and checksum since there is no data.  The `ping` responds with `pong` command whose data is the nonce sent with ping command.