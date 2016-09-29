
require('dotenv').config();
const request = require("request");
const honestbee = require('./lib/honestbee');


honestbee.order().then(function(response){
  console.log(response);
  return honestbee.status(response.orderGuid) 
}).then( (response) => {
  console.log(response); //response is the same object as the one returned from honestbee.order()
})

