const constants = require('./constants');

async function getStakingAddress(web3) {
    const ValidatorSetAuRa = await getContract('ValidatorSetAuRa', web3);
    return await ValidatorSetAuRa.instance.methods.stakingContract().call();
}

/*
Returns an instance of web3.eth.Contract for the given contract.
The contract address is inferred, if possible from parity-data/spec or reading the chain, with constants.js as fallback.
*/
async function getContract(contractName, web3) {
    let abi;
    let info;

    // parse the current chain spec. This should work both for POSDAO-from start and upgrade-to-POSDAO chains
    const spec = require('../parity-data/spec');
    const posdaoTransition = spec.engine.authorityRound.params.posdaoTransition || 0;
    const validatorSetAddress = spec.engine.authorityRound.params.validators.multi[posdaoTransition].contract || constants.VALIDATOR_SET_ADDRESS;
    const blockRewardAddress = spec.engine.authorityRound.params.blockRewardContractAddress ||
        spec.engine.authorityRound.params.blockRewardContractTransitions[posdaoTransition] || constants.BLOCK_REWARD_ADDRESS;

    switch (contractName) {
        case 'RandomAuRa':
            abi = require('../posdao-contracts/build/contracts/RandomAuRa').abi;
            return {
                address: constants.RANDOM_AURA_ADDRESS,
                abi: abi,
                instance: new web3.eth.Contract(abi, constants.RANDOM_AURA_ADDRESS),
            };
        case 'BlockRewardAuRa':
            abi = require('../posdao-contracts/build/contracts/BlockRewardAuRa').abi;
            return {
                address: blockRewardAddress,
                abi: abi,
                instance: new web3.eth.Contract(abi, blockRewardAddress),
            };

        case 'ValidatorSetAuRa':
            abi = require('../posdao-contracts/build/contracts/ValidatorSetAuRa').abi;
            return {
                address: validatorSetAddress,
                abi: abi,
                instance: new web3.eth.Contract(abi, validatorSetAddress),
            };

        case 'StakingAuRa':
            abi = require('../posdao-contracts/build/contracts/StakingAuRa').abi;

            return {
                address: await getStakingAddress(web3),
                abi: abi,
                instance: new web3.eth.Contract(abi, await getStakingAddress(web3)),
            };

        case 'StakingToken':
            info = require('../parity-data/StakingToken');
            return {
                address: info.address,
                abi: info.abi,
                instance: new web3.eth.Contract(info.abi, info.address),
            };

        default:
            throw new Error('Unknown contract ' + contractName);
    }
}

module.exports = getContract;
