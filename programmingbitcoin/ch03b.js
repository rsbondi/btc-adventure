const { S256Point, N , G} = require('./S256Point')
const bigInt = require('big-integer')

let pnt = G
for(let n = bigInt(0); n.lt(N); n.add(1)) {
    pnt = pnt.add(pnt)
}

console.log('pnt', pnt)