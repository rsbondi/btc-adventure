const { BigFieldElement } = require('./BigFieldElement')
const bigInt = require('big-integer')

const P = bigInt(2).pow(256).subtract(bigInt(2).pow(32)).subtract(997)

class S256Field extends BigFieldElement {
    constructor(num) {
        super(num, P)
    }
}

module.exports = {
    S256Field: S256Field
}
