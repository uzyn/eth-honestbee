/**
 * Consistently returns initialized web3
 */
/* global web3:true */
const Web3 = require('web3');

if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
  const provider = `http://localhost:8545`;
  web3 = new Web3(new Web3.providers.HttpProvider(provider));
}

module.exports = web3;
