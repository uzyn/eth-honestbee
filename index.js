require('dotenv').config();
const { honestbee: Contract } = require('./lib/contracts');
const honestbee = require('./lib/honestbee');
const web3 = require('./lib/web3');

const contract = Contract.deployed();

const orders = {};
const orderIdsAll = [];
const orderIdsPending = [];
let processPendingOrdersTimer = null;
let lastBlock = 0;


function initOrder(id) {
  if (!orders[id]) {
    orders[id] = {
      id,
      client: null,
      params: {},

      lastStateBlock: 0,
      state: 0,
      balance: 0,
    };
    orderIdsAll.push(id);
  }
}

function processPendingOrders() {
  const timerSecs = 2;
  console.log(`Pending orders will be processed in ${timerSecs} seconds.`);
  if (!processPendingOrdersTimer) {
    clearTimeout(processPendingOrdersTimer);
  }

  processPendingOrdersTimer = setTimeout(() => {
    processPendingOrdersTimer = null;

    while (orderIdsPending.length > 0) {
      const id = orderIdsPending.pop();
      const order = orders[id];

      if (order.state < 50) {
        console.log(`Processing order id: ${order.id} state: ${order.state}`);
        // honestbee.order(order.params.order_id).then((response) => {
        honestbee.mockOrder(order.params.order_id).then((response) => {
          if (response.id && response.orderGuid) {
            const sgd = Number.parseFloat(response.totalAmount);
            const eth = sgd / process.env.ETHSGD;
            console.log(`Order costs: SGD ${sgd}, ETH ${eth}`);

            const refund = web3.toBigNumber(order.balance).minus(web3.toWei(eth, 'ether'));

            console.log(`Refunding: ${web3.fromWei(refund, 'ether')}`);
            console.log(order.id, 50, order.client, refund);
            contract.finalize(order.id, 50, order.client, refund, {
              from: process.env.ETHACCOUNT,
              gas: 500000,
            });
          }
        });
      } else {
        console.log(`Order is already final id: ${order.id} state: ${order.state}`);
      }
    }
  }, timerSecs * 1000);
}

function processNewRequestEvent(results) {
  results.map((result) => {
    if (result.args._id) {
      const id = Number.parseInt(result.args._id, 10);
      if (!orders[id]) {
        initOrder(id);
      }
      if (lastBlock < result.blockNumber) {
        lastBlock = result.blockNumber;
      }
      orders[id].client = result.args._client;
      orders[id].params = JSON.parse(result.args._params);
    }
    return result;
  });
}

function processRequestUpdateEvent(results) {
  results.forEach((result) => {
    if (result.args._id) {
      const id = Number.parseInt(result.args._id, 10);
      if (!orders[id]) {
        initOrder(id);
      }
      if (lastBlock < result.blockNumber) {
        lastBlock = result.blockNumber;
      }
      if (result.blockNumber > orders[id].lastStateBlock) {
        orders[id].lastStateBlock = result.blockNumber;
        orders[id].state = parseInt(result.args._state, 10);
        orders[id].balance = result.args._balance.toString();
      }

      if (orders[id].state < 50) {
        orderIdsPending.push(id);
      }
    }
  });

  if (orderIdsPending.length > 0) {
    processPendingOrders();
  }
}

function init() {
  const initNewReqs = new Promise((resolve, reject) => {
    contract.NewRequest().get((err, results) => {
      if (err) {
        return reject(err);
      }
      processNewRequestEvent(results);
      return resolve();
    });
  });

  const initReqUpdates = new Promise((resolve, reject) => {
    contract.RequestUpdate().get((err, results) => {
      if (err) {
        return reject(err);
      }
      processRequestUpdateEvent(results);
      return resolve();
    });
  });

  return Promise.all([initNewReqs, initReqUpdates]);
}

function watch() {
  const fromBlock = lastBlock;
  contract.NewRequest({}, { fromBlock }).watch((err, event) => {
    if (err) {
      return console.error(err);
    }
    console.log(event);
    processNewRequestEvent([event]);
    return true;
  });

  contract.RequestUpdate({}, { fromBlock }).watch((err, event) => {
    if (err) {
      return console.error(err);
    }
    console.log(event);
    processRequestUpdateEvent([event]);
    return true;
  });

  console.log('Service contract events watchers initiated.');
}

init().then(() => {
  console.log('Ready!');
  console.log(orders);
  watch();
});
