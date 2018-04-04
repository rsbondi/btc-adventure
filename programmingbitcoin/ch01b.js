const { BigFieldElement } = require('./BigFieldElement')
const bigInt = require('big-integer')

let a = new BigFieldElement(bigInt(7), bigInt(13))
let b = new BigFieldElement(bigInt(6), bigInt(13))

console.log('equal', a.eq(b))
console.log('not equal', a.neq(b))

console.log(a.add(b).num.value)

a = new BigFieldElement(bigInt(7), bigInt(13))
b = new BigFieldElement(bigInt(12), bigInt(13))
let c = new BigFieldElement(bigInt(6), bigInt(13))

console.log('sum equal', a.add(b).eq(c))

// exercise 2
a = new BigFieldElement(bigInt(11), bigInt(19))
b = new BigFieldElement(bigInt(9), bigInt(19))
c = new BigFieldElement(bigInt(6), bigInt(19))
let d = new BigFieldElement(bigInt(13), bigInt(19))

console.log('diff 11-9 equal', a.sub(b).num.value)
console.log('diff 6-13 equal', c.sub(d).num.value)


a = new BigFieldElement(bigInt(5), bigInt(19))
b = new BigFieldElement(bigInt(3), bigInt(19))
c = new BigFieldElement(bigInt(8), bigInt(19))
d = new BigFieldElement(bigInt(17), bigInt(19))

console.log('product 5*3', a.mul(b).num.value)
console.log('product 8*17', c.mul(d).num.value)

a = new BigFieldElement(bigInt(7), bigInt(19))
b = new BigFieldElement(bigInt(3), bigInt(19))
c = new BigFieldElement(bigInt(9), bigInt(19))
d = new BigFieldElement(bigInt(12), bigInt(19))

console.log('power 7^3', a.pow(b).num.value)
console.log('power 9^12', c.pow(d).num.value)

// exercise 4
a = new BigFieldElement(bigInt(95), bigInt(97))
b = new BigFieldElement(bigInt(45), bigInt(97))
c = new BigFieldElement(bigInt(31), bigInt(97))

console.log('95⋅45⋅31',a.mul(b).mul(c).num.value)

a = new BigFieldElement(bigInt(17), bigInt(97))
b = new BigFieldElement(bigInt(13), bigInt(97))
c = new BigFieldElement(bigInt(19), bigInt(97))
d = new BigFieldElement(bigInt(44), bigInt(97))

console.log('17⋅13⋅19⋅44',a.mul(b).mul(c).mul(d).num.value)

a = new BigFieldElement(bigInt(12), bigInt(97))
b = new BigFieldElement(bigInt(7), bigInt(97))
c = new BigFieldElement(bigInt(77), bigInt(97))
d = new BigFieldElement(bigInt(49), bigInt(97))

console.log('12^7⋅17^49',a.pow(b).mul(c.pow(d)).num.value)

// exercise 5
const set = [bigInt(1), bigInt(3), bigInt(7), bigInt(13), bigInt(18)]
set.forEach(k => {
    const newSet = []
    for(let n=0;n < 19; n++) {
        newSet.push(new BigFieldElement(bigInt(n), bigInt(19)).mul(new BigFieldElement(k, bigInt(19))))
    }
    console.log(`new set mul ${k}`, JSON.stringify(newSet.map(f => f.num).sort((a, b) => a-b)))
})

// exercise 7
const ps = [bigInt(7), bigInt(11), bigInt(17), bigInt(31), bigInt(43)]
ps.forEach(p => {
    const f = []
    for(let i=1; i<p; i++) {
        f.push(new BigFieldElement(bigInt(i), bigInt(p)).pow(new BigFieldElement(bigInt(p-1), bigInt(p))))
    }
    const big = f.map(bf => bf.num).map(bi => bi.value)
    console.log(`n ^ ${p-1}`, JSON.stringify(big))
})

a = new BigFieldElement(bigInt(2), bigInt(19))
b = new BigFieldElement(bigInt(7), bigInt(19))
c = new BigFieldElement(bigInt(5), bigInt(19))

console.log('2/7', a.div(b).num.value)
console.log('7/5', b.div(c).num.value)

set.forEach(k => {
    const newSet = []
    for(let n=0;n < 19; n++) {
        newSet.push(new BigFieldElement(bigInt(n), bigInt(19)).div(new BigFieldElement(bigInt(k), bigInt(19))))
    }
    console.log(`new set div ${k}`, JSON.stringify(newSet.map(f => f.num).sort((a, b) => a.subtract(b))))
})