const { S256Point, N , G} = require('./S256Point')
const bigInt = require('big-integer')

const GtimesN = G.mul(N)
console.log(GtimesN.infinity)