const {SHA256} = require('crypto-js');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');


class Block{
    constructor(timestamp,transactions,previousHash=''){
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.nonce = 0;

        this.hash = this.calculateHash();
    }

    calculateHash(){
        return SHA256(this.timestamp + this.nonce + JSON.stringify(this.transactions) + this.previousHash).toString();
    }

    mineBlock(difficulty){
        while(this.hash.substring(0,difficulty) !== Array(difficulty + 1).join('0')){
            this.nonce = this.nonce + 1;
            this.hash = this.calculateHash();

            console.log("NONCE: ",this.nonce);
            console.log("HASH: ",this.hash);
        }
        console.log('Block mined ...', this.hash);
    }

    hasValidTransaction(){
        console.log(this.transactions);

        for(const transaction of this.transactions){
            if(!transaction.isValid()){
                return false;
            }
        }
        return true;
    }
}

class Blockchain{
    constructor(){
        this.chain = [this.createGenesisBlock()];
        this.pendingTransactions = [];
        this.miningReward = 100;
        this.difficulty = 2;
    }

    createGenesisBlock(){
        return new Block(Date.now().toString(), [], '0');
    }

    getLatestBlock(){
        return this.chain[this.chain.length - 1];
    }

    minePendingTransaction(rewardMiningAddress){
        const rewardTransaction = new Transaction(null, rewardMiningAddress, this.miningReward);
        this.pendingTransactions.push(rewardTransaction);

        console.log("Mining start...");

        const block = new Block(Date.now().toString(), this.pendingTransactions, this.getLatestBlock().hash);
        block.mineBlock(this.difficulty);

        console.log("Block successfully mined !");
        this.chain.push(block);

        this.pendingTransactions = []; // Tüm transactionları işledik diyelim.
    }

    getBalanceOfAddress(address){
        let balance = 0;

        for(const block of this.chain){
            for(const transaction of block.transactions){
                if(address === transaction.fromAddress){
                    balance = balance - transaction.amount;
                }
                if(address === transaction.toAddress){
                    balance = balance + transaction.amount;
                }
            }
        }

        return balance;
    }

    createTransaction(transaction){
        if(!transaction.fromAddress || !transaction.toAddress){
            throw new Error('Transaction must include from and to address');
        }
        this.pendingTransactions.push(transaction);
    }

    isChainValid(){
        for(let i = 1;i<this.chain.length;i++){
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i-1];
            if(!currentBlock.hasValidTransaction()){
                return false;
            }
            if(currentBlock.previousHash !== previousBlock.hash){
                return false;
            }
            if(currentBlock.hash !== currentBlock.calculateHash()){
                console.log("CurrentBlock hash: ",currentBlock.hash);
                console.log("CurrentBlock calculateHash(): ",currentBlock.calculateHash());
                return false;
            }
        }
        return true;
    }
}

class Transaction{
    constructor(fromAddress, toAddress, amount){
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;

        this.hash = this.calculateHash();
    }

    signTransaction(signingKey){
        this.hash = this.calculateHash();
        this.signature = signingKey.sign(this.hash,'base64');
        this.derSignature = this.signature.toDER('hex');

        console.log('SIGNATURE: ',this.signature);
        console.log('derSIGNATURE: ',this.derSignature);
        console.log('HASH: ',this.hash);
        console.log('calculateHash(): ',this.calculateHash());
    }

    calculateHash(){
        return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
    }

    isValid(){
        if(this.fromAddress === null){
            return true;
        }
        if(this.signature === null || this.signature.length === 0){
            throw new Error('No signature in this transaction');
        }

        const publicKey = ec.keyFromPublic(this.fromAddress,'hex');
        return publicKey.verify(this.calculateHash(),this.derSignature);
    }
}


module.exports.Transaction = Transaction;
module.exports.Block = Block;
module.exports.Blockchain = Blockchain;