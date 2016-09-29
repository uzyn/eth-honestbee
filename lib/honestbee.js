var fetch = require('node-fetch');
var FormData = require('form-data');
const request = require("request");
const accessToken = process.env.ACCESS_TOKEN;


/**
 * Creates cart with valid delivery time and returns cart token
 */
function createCart(options, deliveryParams) {
  return requestPromise(options).then( (body) => {
    var cartId = body.id;
    deliveryParams["qs"]["cartId"] = cartId;
    return deliveryParams;
  }).then( (deliveryParams) => {
    return requestPromise(deliveryParams);
  }).then( (body) => {
    let jsonBody = JSON.parse(body)[0].days[0];
    options.body["brand-carts"]["brand-cart-3"]["delivery"] = {
      deliveryDay: jsonBody.day,
      deliveryTime: jsonBody.times[0].startDate,
      deliveryTimeslotId: jsonBody.times[0].id
    }
    return options
  }).then( (options) => {
    return requestPromise(options);
  });
}


/**
 * Creates order in backend system and returns a response object containing orderGuid and status
 */
function order() {
  return createCart(options,deliveryParams).then(function(cart){
    let cartToken = cart.id;
    console.log(`Attempting to make an order for cart with token: ${cartToken}`);

    let data = new FormData();
    data.append('access_token', accessToken); // Shouldn't be checked into source.
    data.append('cart_token', cartToken); // Needs to be generated for each new order.
    return data
  }).then( (data) => {
    return fetch(`${process.env.BACKEND_URL}/api/checkout/order`, {
      method: 'POST',
      body: data
    });
  }).then( (response) => {
    //  Should do error handling here. Properly.
    if (response.status >= 200 && response.status < 300) {
      console.log("Everything Ok.");
      return response.json();
    } else {
      console.log("Error");
      var error = new Error();
      throw error;
    }
  })
}

function status(orderGuid) {
  console.log(`Checking order status for order guid: ${orderGuid}`);
  return fetch(`${process.env.BACKEND_URL}/api/orders/${orderGuid}?access_token=${accessToken}`)
    //  Should do error handling here. Properly.
  .then(function(response){
      if (response.status >= 200 && response.status < 300) {
        console.log("Everything Ok.");
        return response.json();
      } else {
        console.log("Error");
        var error = new Error();
        throw error;
      }
  });
}


function requestPromise(params){
  return new Promise( (resolve, reject) => {
    request(params, function (error, response, body) {
      if (error) return reject(err);
      resolve(body);
    });   
  });
}

const deliveryParams = { method: 'GET',
  url: `${process.env.FRONTEND_URL}/api/api/checkout/delivery_timing`,
  qs: 
   { zoneId: '12',
     storeTotal3: '30.799999999999997',
     cartId: '',
     access_token: accessToken },
  headers: 
   { 'cache-control': 'no-cache',
     accept: 'application/vnd.honestbee+json;version=2',
     'content-type': 'application/json' } };

const options = { method: 'POST',
  url: `${process.env.BACKEND_URL}/api/carts`,
  qs: 
   { access_token: accessToken,
     country_code: 'SG',
     namespace: 'grocery' },
  headers: 
   { 'cache-control': 'no-cache',
     'content-type': 'application/json' },
  body: 
   { 'brand-carts': 
      { 'brand-cart-3': 
         { brandColor: '7f7f7f',
           brandId: 3,
           brandName: 'Fair Price',
           conciergeFee: '0.0',
           delivery: 
            { deliveryDay: '2016-09-28T00:00:00.000+08:00',
              deliveryTime: '2016-09-28T22:00:00.000+08:00',
              deliveryTimeslotId: 234 },
           deliveryFee: '10',
           freeDeliveryAmount: '80',
           id: 'brand-cart-3',
           items: 
            { 'cart-3-item-13787': 
               { alcohol: false,
                 amount: '1.4',
                 amountPerUnit: '1',
                 id: 'cart-3-item-13787',
                 itemTitle: 'New Moon Premium Tom Yum Broth',
                 notes: '',
                 previewImageUrl: 'https://honestbees.s3.amazonaws.com/products/images/480/20_13031754_13031754.jpg',
                 productId: 13787,
                 quantity: 22,
                 quantityDisplay: 22,
                 replacementOption: 'find_best_match',
                 size: '400 ml',
                 soldBy: 'sold_by_item',
                 totalAmount: '30.799999999999997',
                 unitType: 'unit_type_item' } },
           slug: 'fair-price',
           storeId: 3 } },
     countryCode: 'SG',
     currency: 'SGD',
     shippingAddress: 
      { address1: 'Niven Road, 48',
        addressType: 'other',
        city: 'Singapore',
        country: 'Singapore',
        latitude: '1.303605',
        longitude: '103.849703',
        postalCode: '228396' },
     updatedAt: 1475053055255,
     zoneId: 12 },
  json: true };


module.exports = {
  order, 
  status
};