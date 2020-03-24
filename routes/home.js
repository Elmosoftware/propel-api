// @ts-check

// var express = require("express");
var handler = require("express").Router();

//Middleware function specific to this route:
handler.use(function (req, res, next) {

    //Do anything required here like logging, etc...

    next();
});

handler.get('', (req, res) => {
    res.send("<h1>Propel API</h1><p><h2>Reach your servers!</h2></p>");
});

module.exports = handler;