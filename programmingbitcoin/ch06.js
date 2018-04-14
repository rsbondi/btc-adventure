const { Script } = require('./Script')

const bytes = Buffer.from('0021022ff5be117c379c1d3ff245ff1309e1dd1e939384a0b1dd7d59db0a01b3920f13210366096ba1b9e3bbc13f66832ca825a1504c9b08124368eafe3741a0145719c159537a63777cb275ac677577ac68','hex')
const script = Script.parse(bytes)
console.log('script elements', script.elements.map(e => (e.toString(16).length%2 ? '0': '')+e.toString(16)))
