
require('dotenv').config();
const request = require("request");
const honestbee = require('./lib/honestbee');

// 1 = 2 x (5 pax paper), 2 = 5 x cafedirect capsules 
honestbee.order(2).then(function(response){
  console.log(response);
  return honestbee.status(response.orderGuid) 
}).then( (response) => {
  console.log(response); //response is the same object as the one returned from honestbee.order()
})

