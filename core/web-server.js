// @ts-check

//Node libraries
const util = require('util');

//Express App & Middlewares dependencies:
const express = require("express");
const bodyParser = require("body-parser");

//Core Propel API services and helpers:
const cfg = require("./config")
const Router = require("./router");

/**
 * Express JS based Web Server
 */
class WebServer {

    constructor() {
        this.app = express();
        this.router = new Router(this.app);
    }

    start() {
        //Setting up Middlewares:
        this.app.use(bodyParser.json()); // to support JSON-encoded bodies.
        this.app.use(bodyParser.urlencoded({ extended: true })); // to support URL-encoded bodies.

        //Setting up routes:
        this.router.setup();

        //Starting HTTP Server:
        return util.promisify(this.app.listen).bind(this.app)(cfg.port);
    }
}

module.exports = new WebServer();