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

database.connect(); //Database setup.
webServer.start(); //Web Server and routing services start.

function closeHandler(err, origin, code = 1) {
    logger.logError(`There was an error on: "${origin}", error details are: \n${String(err)}`);
    logger.logInfo(`Exiting now with code ${code}`);
    process.exit(code);
}

process.on("unhandledRejection", closeHandler);
process.on('SIGKILL', closeHandler);
process.on('SIGINT', closeHandler);
process.on('SIGUSR1', closeHandler);
process.on('SIGUSR2', closeHandler);