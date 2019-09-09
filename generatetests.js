const child_process = require("child_process")
const tests = require('./test/rawtx')
const fs = require('fs')

fs.appendFileSync('test/json.js', 'module.exports = [\n');


function addentry(tx, json) {
    const out = `    {
        "tx": "${tx}",
        "json": ${json}
    },
`
    fs.appendFileSync('test/json.js', out);
}

tests.forEach((t,i) => {
    setTimeout(() => {
        json = child_process.execSync(`bitcoin-cli -regtest decoderawtransaction ${t.tx}`)
            .toString()
        addentry(t.tx, json)
        if(i==tests.length-1) fs.appendFileSync(']');
    }, 100)
})
