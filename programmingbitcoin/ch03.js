const { Point } = require('./FieldPoint')
const { FieldElement } = require('./FieldElement')


let a = new FieldElement(0, 103)
let b = new FieldElement(7, 103)
let x = new FieldElement(17, 103)
let y = new FieldElement(64, 103)

// initialization check 2nd sentance of "Elliptic Curves over Finite Fields"
let p1 = new Point(x, y, a, b) 

// just for fun
console.log('eq', p1.eq(p1))
console.log('neq', p1.neq(p1))

// exercise 1(manual y^2=x^3+7 over F223), exercise 2(code)
const points = [
    {x: 192, y: 105}, // 98, 98
    {x: 17, y: 56},   // 14, 14
    {x: 200, y: 119}, // 105, 112
    {x: 42, y: 99}    // 59, 212
]

a = new FieldElement(0, 223)
b = new FieldElement(7, 223)

points.forEach(p => {
    try {
        x = new FieldElement(p.x, 223)
        y = new FieldElement(p.y, 223)
        let pt = new Point(x, y, a, b)    
    } catch(e) {console.log(`xx point (${p.x}, ${p.y}) is not on the curve`); return}
    console.log(`** point (${p.x}, ${p.y}) is on the curve`)
})

// random point at infinity sanity check {
    let nullfield
    try {
        nullfield = new FieldElement(null, 223)
        let p = new Point(nullfield, nullfield, a, b)
        console.log('point at infinity initializes')
    } catch(e) {console.log('can not initialize to point at infinity')}

    const inf = new Point(nullfield, nullfield, a, b)
    const notinf = new Point(new FieldElement(192, 223), new FieldElement(105, 223), a, b)

    const infadd = inf.add(notinf)
    const noinfadd = notinf.add(inf)
    console.log(`point at infinity addition (${infadd.x.num}, ${infadd.y.num})`)
    console.log(`point at infinity addition communicative (${noinfadd.x.num}, ${noinfadd.y.num})`)

    // const minusnotinf = new new Point(new FieldElement(192, 223), new FieldElement(-105, 223), a, b)
    // console.log('add negative of point', notinf.add(minusnotinf))
// console.log('add negative of point communicative', minusnotinf.add(notinf)) }


// Exercise 3

let addends = [
    {x: 170, y: 142}, 
    {x: 60, y: 139},   
    {x: 47, y: 71}, 
    {x: 17, y: 56}    
].map(el => new Point(new FieldElement(el.x, 223), new FieldElement(el.y, 223), a, b))

let sum = addends[0].add(addends[1]).add(addends[2]).add(addends[3])
console.log(`add (${sum.x.num}, ${sum.y.num})`)

addends = [
    {x: 143, y: 98}, 
    {x: 76, y: 66},   
].map(el => new Point(new FieldElement(el.x, 223), new FieldElement(el.y, 223), a, b))

sum = addends[0].add(addends[1])
console.log(`add (${sum.x.num}, ${sum.y.num})`)
