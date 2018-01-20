# btc-adventure
Sharing my learning experience of the inner workings of bitcoin.  They say the best way to learn is to teach, so I will explain topics here as I learn them.

This repository is for me to share my learning progress with bitcoin technologies.  
It is not meant to be a definitive guide, but it hopes to be helpful for those who also wish to learn.
The code is also not meant to be an example of design architecture, all examples are written for ease of following the specifics of each topic.
Error checking is omitted for clarity
There are plenty of battle tested libraries out there, so the objective is not to create yet another one.

Thank you for taking the time to share in the journey with me and I hope you and I can work together on creating a brighter future.

To begin the adventure, it is recommended that you have basic familiarity with the bitcoin api, you can use the bitcoind/bitcoin-cli
or [chainquery](https://chainquery.com/bitcoin-api).  This will be useful for example, retrieving a raw transaction for parsing.

This is a work in progress and nothing should be taken, much is being developed as I learn so there expect gaps in all sections for now, any comments
to improve the accuracy of the matierial are welcome.

# Table of contents
Section Name | Text | Code
-------------| ---- | ----
Parsing raw bitcoin script | [read](./doc/script.md) | [script.js](./src/script.js) / [common.js](./src/common.js)
Parsing raw bitcoin transaction | [read](./doc/transaction.md) | [transaction.js](./src/transaction.js)
Parsing raw block | [read](./doc/block.md) | [block.js](./src/block.js)
Building raw transaction | [read](./doc/createrawtx.md) | [transaction.js](./src/transaction.js)
Interpreting a script | [read](./doc/interpret.md) | [interpret.js](./src/interpret.js)
Communicating with peers | [read](./doc/peers.md) | [peers.js](./src/peers.js)

