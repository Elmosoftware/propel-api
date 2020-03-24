// @ts-check

/*
    Propel API
*/

// @ts-ignore
const ver = require('./package.json').version
require('dotenv').config()

console.log(`\n -------------------------  Propel API  v${ver} ------------------------- \n`);
console.log(`\n     --------------------  Reach your servers! -------------------- \n`);

//Core Propel API services and helpers:
const logger = require("./services/logger-service");
const cfgVal = require("./util/config-validator");
const webServer = require("./core/web-server");
const database = require("./core/database")

//Configuration validation:
if (!cfgVal.validateConfig().isValid) {
    logger.logWarn(`\n\nIMPORTANT: The following configuration errors could prevent the application to start:\n${cfgVal.getErrors().message}
    Please, review your ".env" file and adjust it accordingly.\n\n`);
}

//Database setup:
database.connect()

//Web Server and routing services start:
webServer.start();
