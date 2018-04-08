const { S256Point} = require('./S256Point')
const { S256Field} = require('./S256Field')
const bigInt = require('big-integer')

const px = bigInt("1b1981a0d37c66ad3a35b28a57bdec8d1bd9f4780aa3e9bd4137a0bffa5bb6cf", 16)
const py = bigInt("2c893aaed22b7b7f59997b73036f7ee41d111c95d75c67798ff06bf30cf911c8", 16)
const pub = new S256Point(new S256Field(px), new S256Field(py) )

const ser = pub.sec()
console.log('serialized', ser)