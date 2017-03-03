require('dotenv').config();
const Client = require('coinbase').Client;

const client = new Client({
  apiKey: process.env.COINBASE_API_KEY,
  apiSecret: process.env.COINBASE_API_SECRET,
});

function get(currencyPair = 'ETH-SGD') {
  return new Promise((resolve, reject) => {
    client.getBuyPrice({ currencyPair }, (err, res) => {
      if (err) {
        return reject(err);
      }
      return resolve(res.data.amount);
    });
  });
}

function ETHSGD() {
  return get('ETH-SGD');
}

module.exports = { get, ETHSGD };
