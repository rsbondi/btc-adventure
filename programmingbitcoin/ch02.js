const { Point } = require('./Point')

// exercise 1
const points = [
    {x: 2, y: 4},
    {x: 1, y: -1},
    {x: 18, y: 77},
    {x: 5, y: 7}
]

points.forEach(p => {
    try {
        let pt = new Point(p.x, p.y, 5, 7)    
    } catch(e) {console.log(`xx point (${p.x}, ${p.y}) is not on the curve`); return}
    console.log(`** point (${p.x}, ${p.y}) is on the curve`)
})

console.log('equal?', new Point(18, 77, 5, 7).eq(new Point(18, 77, 5, 7)))
console.log('not equal?', new Point(18, 77, 5, 7).neq(new Point(18, 77, 5, 7)))

// exercise 3
try {
    let p = new Point(null, null, 5, 7)
    console.log('exercise 3 ok, point at infinity initializes')
} catch(e) {console.log('exercise 3 failed, can not initialize to point at infinity')}

const inf = new Point(null, null, 5, 7)
const notinf = new Point(18, 77, 5, 7)

// test exercise 4
console.log('point at infinity addition', inf.add(notinf))
console.log('point at infinity addition communicative', notinf.add(inf))

// test exercise 5
const minusnotinf = new Point(notinf.x, -notinf.y, notinf.a, notinf.b)
console.log('add negative of point', notinf.add(minusnotinf))
console.log('add negative of point communicative', minusnotinf.add(notinf))
