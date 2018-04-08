const { S256Point, N , G} = require('./S256Point')
const { S256Field} = require('./S256Field')
const { Signature} = require('./Signature')
const { PrivateKey} = require('./PrivateKey')
const bigInt = require('big-integer')

const GtimesN = G.mul(N)
console.log('G*N is infinity', GtimesN.infinity)

const px = bigInt("1b1981a0d37c66ad3a35b28a57bdec8d1bd9f4780aa3e9bd4137a0bffa5bb6cf", 16)
const py = bigInt("2c893aaed22b7b7f59997b73036f7ee41d111c95d75c67798ff06bf30cf911c8", 16)
const pub = new S256Point(new S256Field(px), new S256Field(py) )

const pr = bigInt("f93441bb92d20b7383732687cf662f3b0aeb1ea4ef6f3db2f745f16ca63c18ed", 16)
const ps = bigInt("783e6eb62119728c016e30bfec33af09e24a80b0c393b269533c38d04c554503", 16)
const sig = new Signature(pr, ps)
const z = bigInt("105972246877210721199207522504125616681057461801649900988576839705109145961658")

const ok = pub.verify(z, sig)
console.log('sig ok', ok)

const pk = new PrivateKey(bigInt("111111111111111111111111111111111111111111"))
const signed = pk.sign(z)

const sigok = pk.point.verify(z, signed)
console.log('sig ok',sigok)