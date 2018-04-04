//const { S256Field } = require('./S256Field')
const { BigPoint } = require('./BigPoint')
const bigInt = require('big-integer')

const points = [
    {x: 2, y: 4},
    {x: 1, y: -1},
    {x: 18, y: 77},
    {x: 5, y: 7}
]

points.forEach(p => {
    try {
        let pt = new BigPoint(bigInt(p.x), bigInt(p.y), bigInt(5), bigInt(7))    
    } catch(e) {console.log(`xx point (${p.x}, ${p.y}) is not on the curve`); return}
    console.log(`** point (${p.x}, ${p.y}) is on the curve`)
})