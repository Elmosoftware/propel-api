// @ts-check

//Express App & Middlewares dependencies:
const express = require("express");
const bodyParser = require("body-parser");

//Core Propel API services and helpers:
const logger = require("../services/logger-service");
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
        this.app.listen(process.env.PORT, () => {

            if (process.env.NODE_ENV == "production") {
                console.warn(`\n
            =============================================================
            CURRENT ENVIRONMENT SETTINGS CORRESPONDS TO: PRODUCTION SITE.
            =============================================================\n`)
            }

            logger.logInfo(`Executing on folder: ${__dirname}`);
            logger.logInfo(`Executing script: ${__filename}`);
            logger.logInfo(`\nServer is ready and listening on port:${process.env.PORT}!\n`);
            logger.logInfo(`\nPropel API STARTED on "${process.env.NODE_ENV}" environment.\n`);
        });
    }
}

module.exports = new WebServer();
