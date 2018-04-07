const { BigPoint } = require('./BigPoint')
const { BigFieldElement } = require('./BigFieldElement')
const bigInt = require('big-integer')

const oneOthree = bigInt(103)

let a = new BigFieldElement(bigInt(0), oneOthree)
let b = new BigFieldElement(bigInt(7), oneOthree)
let x = new BigFieldElement(bigInt(17), oneOthree)
let y = new BigFieldElement(bigInt(64), oneOthree)

// initialization check 2nd sentance of "Elliptic Curves over Finite Fields"
let p1 = new BigPoint(x, y, a, b) 

// just for fun
console.log('eq', p1.eq(p1))
console.log('neq', p1.neq(p1))
