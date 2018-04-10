const { S256Point} = require('./S256Point')
const { S256Field} = require('./S256Field')
const { Signature} = require('./Signature')
const { PrivateKey} = require('./PrivateKey')
const { Util } = require('./Util')

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

console.log('base58', Util.encode_base58(Buffer.from('000000abcd1234','hex')).toString()) // random but verified against python code

const dsha = Util.double_sha256(Buffer.from('020000000001016a15ae3073d259a9c648e88c0ee0b15acdafa6d3168ca5a5907cf71497748edc0000000017160014045af48f15a9727d0eaa60cc88305cf396573e77feffffff0300ab90410000000017a91453248a09fef48fa3af9459fc8c024e14c26fafda87d827c3230000000017a914a740765b6c2751643cf4b94ae7ea6e12c3fa97078700ab90410000000017a914c26b964edd90f539c37266f7f35db07ecac784e08702473044022063a33c9ffda5f7b25956949ce3450a3adf17dfbfce79981d016758c71162279f0220355d662423d82d70c9075057da4a733e8165b4c130dade8a8795e80bea111ba701210250971a55bdd967718b736557a645d9a027617c7c5a3c0ad5a16ba20eb2eb0c9761000000', 'hex'))
console.log('double sha256', dsha.toString('hex')) // the reverse of this is tx hash

console.log('base58chk', Util.encode_base58_checksum(Buffer.from('abcd1234','hex')).toString())


const pk = new PrivateKey(bigInt("0C28FCA386C7A227600B2FE50B7CAE11EC86D3BF1FBE471BE89827E19D72AA1D", 16))
console.log('address', pk.point.address().toString())
console.log(pk.wif().toString())

