const { S256Point} = require('./S256Point')
const { S256Field} = require('./S256Field')
const { Signature} = require('./Signature')
const bigInt = require('big-integer')

const px = bigInt("1b1981a0d37c66ad3a35b28a57bdec8d1bd9f4780aa3e9bd4137a0bffa5bb6cf", 16)
const py = bigInt("2c893aaed22b7b7f59997b73036f7ee41d111c95d75c67798ff06bf30cf911c8", 16)
const pub = new S256Point(new S256Field(px), new S256Field(py) )

const ser = pub.sec()
console.log('sec serialized', ser)

const cser = pub.sec(true)
console.log('sec compressed serialized', cser)

const xCubedPlus7 = pub.x.pow(pub.three).add(pub.b).sqrt()
const calcy = pub.a.prime.subtract(xCubedPlus7.num) // subtract for 0x02, xCubedPlus7 for 0x03
console.log('sqrt', calcy.toString(), pub.y.num.toString())

const pr = bigInt("f93441bb92d20b7383732687cf662f3b0aeb1ea4ef6f3db2f745f16ca63c18ed", 16)
const ps = bigInt("783e6eb62119728c016e30bfec33af09e24a80b0c393b269533c38d04c554503", 16)
const sig = new Signature(pr, ps)
console.log('der', sig.der().toString('hex'))

console.log('base58', pub.encode_base58(new Buffer.from('000000abcd1234','hex')).toString())