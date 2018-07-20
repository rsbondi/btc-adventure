const { Payment }= require('./payment')
const testdata = require('./testdata')

console.log("***************** DECODE ****************\n")

function decodelog(p) {
    const parsed = Payment.decode(p)
    console.log(JSON.stringify(parsed, null, 2))
}

testdata.encoded.forEach(decodelog)
// TODO: these are mostly working but I get trainling zeros some times, need to investigate

console.log("/n***************** ENCODE ****************\n")

for(let i=0; i<testdata.decoded.length; i++) {
    console.log(testdata.encoded[i])
    console.log(Payment.encode(testdata.decoded[i]).slice(0, -6))
    console.log(' ')
}

// TODO: here more off by one issues to resolve
