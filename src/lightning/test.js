const { Payment }= require('./payment')
const { Bit }= require('./bit')
const bech32 = require('bech32')

// example: https://github.com/lightningnetwork/lightning-rfc/blob/master/11-payment-encoding.md
const donate  = 'lnbc1pvjluezpp5qqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqypqdpl2pkx2ctnv5sxxmmwwd5kgetjypeh2ursdae8g6twvus8g6rfwvs8qun0dfjkxaq8rkx3yf5tcsyz3d73gafnh3cax9rn449d9p5uxz9ezhhypd0elx87sjle52x86fux2ypatgddc6k63n7erqz25le42c4u4ecky03ylcqca784w'
const payment = 'lnbc2500u1pvjluezpp5qqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqypqdq5xysxxatsyp3k7enxv4jsxqzpuaztrnwngzn3kdzw5hydlzf03qdgm2hdq27cqv3agm2awhz5se903vruatfhq77w3ls4evs3ch9zw97j25emudupq63nyw24cg27h2rspfj9srp'
const payutf8 = 'lnbc2500u1pvjluezpp5qqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqypqdpquwpc4curk03c9wlrswe78q4eyqc7d8d0xqzpuyk0sg5g70me25alkluzd2x62aysf2pyy8edtjeevuv4p2d5p76r4zkmneet7uvyakky2zr4cusd45tftc9c5fh0nnqpnl2jfll544esqchsrny'
const paylist = 'lnbc20m1pvjluezpp5qqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqypqhp58yjmdan79s6qqdhdzgynm4zwqd5d7xmw5fk98klysy043l2ahrqscc6gd6ql3jrc5yzme8v4ntcewwz5cnw92tz0pc8qcuufvq7khhr8wpald05e92xw006sq94mg8v2ndf4sefvf9sygkshp5zfem29trqq2yxxz7'

// mine
const payto    = '028c1f8d907879ee8691ddab3547e93c5ec2098cc0f38cc39c4ee989cb3a10ae71'
const payhash  = 'deff74870ea8e4f8626406dcf5118e0ceb7d36af713218932e3fcb4ac13fd730'
const preimage = '4c6dcf810c964966ff56aa016dd3dcfc2228cc5b39c431822ae69e2b8a5f5c38'
const payreq   = 'lnbc10u1pdsw4dkpp5mmlhfpcw4rj0scnyqmw02yvwpn4h6d40wyep3yew8l954sfl6ucqdqqcqzysxqrrssaayzylslcav0sr3c7237mwea5k67vk7t3j6pdmvnuuadxy0dsj5zalg6merxgndc74nc753lnuyx7t2sjecfpxp820r9use77n7vyqcpp7dlfy'

console.log(JSON.stringify(Payment.parse(payment), null, 2))
console.log(JSON.stringify(Payment.parse(payutf8), null, 2))
console.log(JSON.stringify(Payment.parse(payreq), null, 2))
console.log(JSON.stringify(Payment.parse(donate), null, 2))
console.log(JSON.stringify(Payment.parse(paylist), null, 2))

// TODO: these are mostly working but I get trainling zeros some times, neet to investigate

