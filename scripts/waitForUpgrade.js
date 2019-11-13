// waits for the posdao transition block to be reached by the connected chain

const fs = require('fs');
const Web3 = require('web3');

async function main() {
    const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:9540'));

    // parse the current chain spec
    const spec = require('../parity-data/spec');
    const posdaoTransition = spec.engine.authorityRound.params.posdaoTransition;

    console.log('=======================================================');
    console.log(`waiting for POSDAO transition scheduled at block ${posdaoTransition} ...`);
    console.log('=======================================================');

    web3.eth.subscribe('newBlockHeaders', function (error, result) {
        if (error) {
            console.log(error);
        }
    }).on("data", async function (blockHeader) {
        if (blockHeader.number) {
            const block = await web3.eth.getBlock(blockHeader.number, true);

            if (posdaoTransition > blockHeader.number) {
                console.log(`Reached block ${blockHeader.number} (waiting for ${posdaoTransition})`);
            } else {
                console.log('=======================================================');
                console.log(`POSDAO transition block ${posdaoTransition} reached!`);
                console.log('=======================================================');
                process.exit(0);
            }
        }
    }).on("error", console.error);
}

main();
