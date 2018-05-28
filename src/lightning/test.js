const { Payment }= require('./payment')
const { Bit }= require('./bit')
const bech32 = require('bech32')

// example: https://github.com/lightningnetwork/lightning-rfc/blob/master/11-payment-encoding.md
const payment = 'lnbc2500u1pvjluezpp5qqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqypqdq5xysxxatsyp3k7enxv4jsxqzpuaztrnwngzn3kdzw5hydlzf03qdgm2hdq27cqv3agm2awhz5se903vruatfhq77w3ls4evs3ch9zw97j25emudupq63nyw24cg27h2rspfj9srp'

// mine
const payto    = '028c1f8d907879ee8691ddab3547e93c5ec2098cc0f38cc39c4ee989cb3a10ae71'
const payhash  = 'deff74870ea8e4f8626406dcf5118e0ceb7d36af713218932e3fcb4ac13fd730'
const preimage = '4c6dcf810c964966ff56aa016dd3dcfc2228cc5b39c431822ae69e2b8a5f5c38'
const payreq   = 'lnbc10u1pdsw4dkpp5mmlhfpcw4rj0scnyqmw02yvwpn4h6d40wyep3yew8l954sfl6ucqdqqcqzysxqrrssaayzylslcav0sr3c7237mwea5k67vk7t3j6pdmvnuuadxy0dsj5zalg6merxgndc74nc753lnuyx7t2sjecfpxp820r9use77n7vyqcpp7dlfy'

console.log(Payment.parse(payment))
