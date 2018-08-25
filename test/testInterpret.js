const { Interpretor } = require('../src/interpret')
const { Transaction } = require('../src/transaction')

let verifyhashes = Transaction.verifyHash(
  "0200000001fc5594b5e6ffa5c19a5e249fbc17671814ea16563cdfd62389dde8929a8682a0010000006a47304402203acf640cab2e9a24444cddc1972fdb9bd0a8daaad1db8898cfb69fc592529a240220033387889d10bf6e14d19a0f4e3f244e243c3c60a19d1c856be7fa76da3b0c6f0121020ed68d4febc7ee85c2683e3c95b65febaee609d2c03540e49785c43f729c4f03ffffffff0190e58509000000001976a914eaa0d36e04e470f7276ffc88d02614af1422242d88ac00000000",
  {
    "a082869a92e8dd8923d6df3c5616ea14186717bc9f245e9ac1a5ffe6b59455fc": {
      vout: [null, { scriptPubKey: { hex: "76a91466a88029995bf795717bbb1551641e6af3cb102288ac" } }]
    }
  }
)
const interpretor = new Interpretor(verifyhashes[0])
// tx vin scriptSig
interpretor.run([ '304402203acf640cab2e9a24444cddc1972fdb9bd0a8daaad1db8898cfb69fc592529a240220033387889d10bf6e14d19a0f4e3f244e243c3c60a19d1c856be7fa76da3b0c6f', // signature
                  '020ed68d4febc7ee85c2683e3c95b65febaee609d2c03540e49785c43f729c4f03']) // pubkey

// previous tx scriptPutbKey OP_DUP OP_HASH160 66a88029995bf795717bbb1551641e6af3cb1022 OP_EQUALVERIFY OP_CHECKSIG
interpretor.run([ 'OP_DUP',
                  'OP_HASH160', 
                  '66a88029995bf795717bbb1551641e6af3cb1022', 
                  'OP_EQUALVERIFY',
                  'OP_CHECKSIG']) 
