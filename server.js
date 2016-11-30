require('dotenv').config();
const app = require('express')();
const bodyParser = require('body-parser');
const request = require("request");
const honestbee = require('./lib/honestbee');

app.use(bodyParser.json());

app.all('/*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('X-Powered-By', 'eth-honestbee');
  next();
});

app.get('/', (req, res) => {
  honestbee.order().then(function(response){
    console.log(response);
    return honestbee.status(response.orderGuid)
  }).then( (response) => {
    res.send('Order placed. Wait for confirmation email from honestbee. Total: SGD 55.2 (ETH 4.71).'),
    console.log(response); //response is the same object as the one returned from honestbee.order()
  })
});

const server = app.listen(process.env.API_SERVER_PORT, () => {
  const host = server.address().address;
  const port = server.address().port;

  console.log(`eth-honestbee API server is now listening at http://${host}:${port}`);
});
