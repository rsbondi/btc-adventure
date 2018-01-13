# Parsing raw block

Reference code from [block.js](../src/block.js)



## Block Header
A raw block consist of an 80 byte header information and all raw transactions concatenated after the header

Here is the block description verbatim from the bitcoin wiki

| Bytes | Name                | Data Type | Description
|-------|---------------------|-----------|----------------
| 4     | version             |  int32_t  | The [block version][/en/glossary/block]{:#term-block-version}{:.term} number indicates which set of block validation rules to follow. See the list of block versions below.
| 32    | [previous block header hash][]{:#term-previous-block-header-hash}{:.term} | char[32]  | A SHA256(SHA256()) hash in internal byte order of the previous block's header.  This ensures no previous block can be changed without also changing this block's header.
| 32    | merkle root hash    | char[32]  | A SHA256(SHA256()) hash in internal byte order. The merkle root is derived from the hashes of all transactions included in this block, ensuring that none of those transactions can be modified without modifying the header.  See the [merkle trees section][section merkle trees] below.
| 4     | time                | uint32_t  | The block time is a Unix epoch time when the miner started hashing the header (according to the miner).  Must be strictly greater than the median time of the previous 11 blocks.  Full nodes will not accept blocks with headers more than two hours in the future according to their clock.
| 4     | nBits               | uint32_t  | An encoded version of the target threshold this block's header hash must be less than or equal to.  See the nBits format described below.
| 4     | nonce               | uint32_t  | An arbitrary number miners change to modify the header hash in order to produce a hash less than or equal to the target threshold.  If all 32-bit values are tested, the time can be updated or the coinbase transaction can be changed and the merkle root updated.

### Header parsing

```javascript

parseRaw: function(blockstr) {
    const reader   = new Biterator(blockstr)
    const header = {
        version  : reader.readInt(4),
        previous : Bytes.toHex(reader.readBytes(32).reverse()),
        merkle   : Bytes.toHex(reader.readBytes(32).reverse()),
        time     : reader.readInt(4),
        nbits    : Bytes.toHex(reader.readBytes(4).reverse()),
        nonce    : reader.readInt(4)
    }
    ...
}
```

The above is just applying what we learned in previous sections to the definition in the table

## Block Transactions

### Transaction parsing

```javascript
    const ntx = reader.readVarInt()

    let txs =[]
    let txbuf = Bytes.toHex(reader.getRemaining())
    for(let t=0; t<ntx; t++) {
        const tx = Transaction.parseRaw(txbuf)
        txs.push(tx)
        txbuf = txbuf.slice(tx.size*2) 
    }
    return {header: header, transactions: txs} 
}
```
After the header are all transactions included in the block.  The number of transactions is read as a `varInt`

The transactions are raw one following the other.  By parsing a transaction as in the previous section, our iterator will leave us with the count representing the size of the transaction in bytes.  Since we are passing a string at this point, we pass the remaining string and when we get to the end, we slice off the transaction size of the string * 2 for the size of each hex byte of the string.  We start by reading the number of transactions as already mentioned.  We get remaining unread bytes from the buffer and convert back to a string for parsing, slicing off each transaction once parsed.

## Merkle Root

The merkle root is determined by hashing concatenated pairs of hashes recursively until a single hash remains.  See [Mastering Bitcoin](http://chimera.labs.oreilly.com/books/1234000001802/ch07.html#merkle_trees) and [Bitcoin Wiki](https://en.bitcoin.it/wiki/Protocol_documentation#Merkle_Trees) for details

### Calculating

```javascript
calcMerkleRoot: function(txs) {
    function processRow(row) {
        if (row.length % 2) row.push(row[row.length - 1])
        let newrow = []
        for(let start = 0, end = 2; start < row.length; start+=2, end+=2 ) {
            newrow.push(Bytes.reverseHex(Hash.dhash(row.slice(start, end).map(h => Bytes.reverseHex(h)).join(''))))
        }
        return newrow
    }
    let row = txs
    while(row.length > 1) row = processRow(row)
    return row[0]
}
```

Each row must contain an even number of hashes to hash in pairs.  This is checked with:

`if (row.length % 2) row.push(row[row.length - 1])`

This pushes the last item in the rows to even it out

We then loop through one row at a time and hash the concatenation of the pair to create the next row up in the tree

`row.slice(start, end)`

gives the pair of hashes, they are reversed here due to the hashing library chosen, hence the need for mapping here, see note on last line of the section in the wiki linked above, `.join('')` does the concatenation before hashing

We call this process repeatedly until only one item remains, that is our merkle root

```javascript
while(row.length > 1) row = processRow(row)
return row[0]
```