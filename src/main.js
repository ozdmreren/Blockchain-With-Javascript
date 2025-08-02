const {Block,Blockchain,Transaction} = require('./blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const myKey = ec.keyFromPrivate('e490a21b6aec9c72edf972ccbf0e0e596e221f44c79b7018230fc629d0899a2f');
const myKeyWallet = myKey.getPublic('hex');

orhunCoin = new Blockchain();

const transaction = new Transaction(myKeyWallet,"to-address",49);
transaction.signTransaction(myKey);
console.log("ISVALID(): ",transaction.isValid());

orhunCoin.createTransaction(transaction);
orhunCoin.minePendingTransaction(myKeyWallet);
console.log(orhunCoin.isChainValid());

console.log(orhunCoin.getBalanceOfAddress(myKeyWallet));