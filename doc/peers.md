# Communicating with peers on the network

Peer communication is done via a TCP connection, starting with handshaking.  Before that we need to find a peer to connect to.  I started connecting with my own node, this is recommended if possible.  By using your own node, you can see the results, if you are properly sending your user agent, services, block info, pong response etc.  You can also see the list of peers connected to your node to try connecting to other nodes.  If you don't have a node available, you can connect to a known node.  You can get a list from various dns seeds, these are hard coded into the reference client, and can be found [here](https://github.com/bitcoin/bitcoin/blob/master/src/chainparams.cpp#L128:9).  From a command prompt you can run `nslookup seedaddress` where `seedaddres` is one of the addresses coded in the link above.  This command will give you a list of nodes to try to get started.

## Handshaking

Handshaking is required to connect to a peer, it starts with the `version` command which tells a node basic info about your client, the node will respond with a `verack` command, short for "version acknowledgement".

