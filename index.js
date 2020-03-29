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

database.start() //Database setup.
    .then((data) => {
        logger.logInfo(`Successfully connected to Mongo DB instance!
Connection options in use:\n${JSON.stringify(database.options)
                .replace(/,/g, "\n")
                .replace(/{/g, "")
                .replace(/}/g, "")}\n`)

        logger.logInfo("Starting HTTP server...")
        webServer.start() //Web Server and routing services start.
            .then(() => {
                if (process.env.NODE_ENV == "production") {
                    logger.logWarn(`\n
                =============================================================
                CURRENT ENVIRONMENT SETTINGS CORRESPONDS TO: PRODUCTION SITE.
                =============================================================\n`)
                }

                logger.logInfo(`Executing on folder: ${__dirname}`);
                logger.logInfo(`Executing script: ${__filename}`);
                logger.logInfo(`Server is ready and listening on port:${process.env.PORT}!`);
                logger.logInfo(`\n\nPropel API STARTED on "${process.env.NODE_ENV}" environment.\n`);
            })
        .catch((err) => {
            closeHandler(err)
        })
    })
    .catch((err) => {
        closeHandler(err)
    })

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