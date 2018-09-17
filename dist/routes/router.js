'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _joi = require('joi');

var _joi2 = _interopRequireDefault(_joi);

var _model = require('../model');

var _model2 = _interopRequireDefault(_model);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

router.get('', function (req, res) {
  res.send('hello world');
});

router.get('/orders', function (req, res) {
  res.status(200).json(_model2.default);
});

router.get('/orders/:id', function (req, res) {
  var orderId = Number(req.params.id);
  var result = isInteger(orderId);
  if (!result) {
    return res.status(403).send({
      success: false,
      message: "id must be an interger"
    });
  }
  var theOrder = _model2.default.find(function (order) {
    return order.id === orderId;
  });
  if (!theOrder) {
    return res.status(404).send({
      success: false,
      message: 'The given order cant be found in the database'
    });
  }
  res.status(200).send({
    success: true,
    message: 'order was successfully found',
    order: theOrder
  });
});

router.post('/orders', function (req, res) {
  var schema = {
    quantity: _joi2.default.number().required(),
    price: _joi2.default.number().required(),
    desc: _joi2.default.string().required(),
    userid: _joi2.default.number().required()
  };

  var _Joi$validate = _joi2.default.validate(req.body, schema),
      error = _Joi$validate.error;

  if (!error) {
    var _req$body = req.body,
        quantity = _req$body.quantity,
        userid = _req$body.userid,
        desc = _req$body.desc,
        price = _req$body.price;


    var order = {
      id: _model2.default.length + 1,
      userid: userid,
      quantity: quantity,
      desc: desc,
      createdAt: new Date(),
      price: price,
      status: false,
      completed: false
    };
    _model2.default.unshift(order);
    res.status(200).send({
      success: true,
      message: 'order was successfully posted',
      order: order
    });
  } else {
    return res.status(403).send({
      success: false,
      message: error.message
    });
  }
});

router.put('/orders/:id', function (req, res) {
  var orderId = Number(req.params.id);
  var result = isInteger(orderId);
  if (!result) {
    return res.status(403).send({
      success: false,
      message: "id must be an interger"
    });
  }
  var theOrder = _model2.default.find(function (order) {
    return order.id === orderId;
  });
  if (!theOrder) {
    return res.status(404).send({
      success: false,
      message: 'The given order cant be found in the database'
    });
  }
  var newOrder = theOrder;
  newOrder.status = !theOrder.status;
  _model2.default.splice(_model2.default.indexOf(theOrder), 1, newOrder);
  res.status(200).send({ success: true, message: 'order was successfully updated', newOrder: newOrder });
});

function isInteger(input) {
  return Number.isInteger(input);
}

exports.default = router;