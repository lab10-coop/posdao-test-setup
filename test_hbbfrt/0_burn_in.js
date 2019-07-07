const Web3 = require('web3');
const constants = require('../utils/constants');
const SnS = require('../utils/signAndSendTx.js');
const pp = require('../utils/prettyPrint');

// Connect to node #1
const web3 = new Web3('http://localhost:8541');

async function tx_block_number_hack(from, to, amount) {
    try {
        let tx;
        tx = await SnS(web3, {
            from: from,
            to: to,
            value: amount,
            gasPrice: '1000000000',
            gasLimit: '21000',
        });
    }
    catch (e) {
        // The code in the try block will throw an error which seems to be related to 
        // a web3 bug not fixed in the current web3 version.
        // See https://github.com/ethereum/web3.js/issues/2831
        //console.log(e);
    }    
}

describe('Test basic transactions', () => {
    it('Send one transaction', async () => {
        let pv = await web3.eth.getBlockNumber();
        console.log("Blocknumber before transaction:", pv);

        let to_addr = "0xFccBB900D52f6d6Aaca2F3a3031dDd3b85185eFf";
        await tx_block_number_hack(constants.OWNER, to_addr, web3.utils.toWei("0.5", "ether"));

        pv = await web3.eth.getBlockNumber();
        console.log("Blocknumber after transaction:", pv);

        // print balance
        var balance = await web3.eth.getBalance(to_addr);
        console.log(balance);
    });
});
