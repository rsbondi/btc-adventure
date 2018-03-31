const { FieldElement } = require('./FieldElement')

let a = new FieldElement(7, 13)
let b = new FieldElement(6, 13)

console.log('equal', a.eq(b))
console.log('not equal', a.neq(b))

console.log(a.add(b).num)

a = new FieldElement(7, 13)
b = new FieldElement(12, 13)
let c = new FieldElement(6, 13)

console.log('sum equal', a.add(b).eq(c))

// exercise 2
a = new FieldElement(11, 19)
b = new FieldElement(9, 19)
c = new FieldElement(6, 19)
let d = new FieldElement(13, 19)

console.log('diff 11-9 equal', a.sub(b).num)
console.log('diff 6-13 equal', c.sub(d).num)


a = new FieldElement(5, 19)
b = new FieldElement(3, 19)
c = new FieldElement(8, 19)
d = new FieldElement(17, 19)

console.log('product 5*3', a.mul(b).num)
console.log('product 8*17', c.mul(d).num)

a = new FieldElement(7, 19)
b = new FieldElement(3, 19)
c = new FieldElement(9, 19)
d = new FieldElement(12, 19)

console.log('power 7^3', a.pow(b).num)
console.log('power 9^12', c.pow(d).num)

// exercise 4
a = new FieldElement(95, 97)
b = new FieldElement(45, 97)
c = new FieldElement(31, 97)

console.log('95⋅45⋅31',a.mul(b).mul(c).num)

a = new FieldElement(17, 97)
b = new FieldElement(13, 97)
c = new FieldElement(19, 97)
d = new FieldElement(44, 97)

console.log('17⋅13⋅19⋅44',a.mul(b).mul(c).mul(d).num)

a = new FieldElement(12, 97)
b = new FieldElement(7, 97)
c = new FieldElement(77, 97)
d = new FieldElement(49, 97)

console.log('12^7⋅17^49',a.pow(b).mul(c.pow(d)).num)

// exercise 5
const set = [1, 3, 7, 13, 18]
set.forEach(k => {
    const newSet = []
    for(let n=0;n < 19; n++) {
        newSet.push(new FieldElement(n, 19).mul(new FieldElement(k, 19)))
    }
    console.log(`new set mul ${k}`, JSON.stringify(newSet.map(f => f.num).sort((a, b) => a-b)))
})

// exercise 7
const ps = [7, 11, 17, 31, 43]
ps.forEach(p => {
    const f = []
    for(let i=1; i<p; i++) {
        f.push(new FieldElement(i, p).pow(new FieldElement(p-1, p)))
    }
    console.log(`n ^ ${p-1}`, JSON.stringify(f.map(f => f.num)))
})

a = new FieldElement(2, 19)
b = new FieldElement(7, 19)
c = new FieldElement(5, 19)

console.log('2/7', a.div(b).num)
console.log('7/5', b.div(c).num)

/*
Exercise 8
Solve the following equations in F31:

3 / 24

17-3

4-4⋅11
*/

// exercise 9
// set from exercise 5
set.forEach(k => {
    const newSet = []
    for(let n=0;n < 19; n++) {
        newSet.push(new FieldElement(n, 19).div(new FieldElement(k, 19)))
    }
    console.log(`new set div ${k}`, JSON.stringify(newSet.map(f => f.num).sort((a, b) => a-b)))
})