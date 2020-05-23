// @ts-check

/*
    Propel API
*/

console.log(`\n -------------------------  Propel API ------------------------- \n`);
console.log(`\n     --------------------  Reach your servers! -------------------- \n`);

//Core Propel API services and helpers:
import { cfg } from "./core/config";
import { logger } from "./services/logger-service";
import { cfgVal } from "./validators/config-validator";
import { webServer } from "./core/web-server";
import { db } from "./core/database";

//Configuration validation:
if (!cfgVal.validate().isValid) {
    //@ts-ignore
    logger.logWarn(`\n\nIMPORTANT: One or more configuration errors prevent the application to start:\n
Check the details below in order to review and remediate your ".env" file accordingly.\n\n`);
    closeHandler(cfgVal.getErrors(), "Application start");
}

db.start() //Database setup.
    .then((data: any) => {
        logger.logInfo(`Successfully connected to Mongo DB instance! Options in use:
        ${JSON.stringify(db.options)
                .replace(/,/g, "\n\t")
                .replace(/{/g, "")
                .replace(/}/g, "")}\n`);

        logger.logInfo("Starting HTTP server...")
        webServer.start() //Web Server and routing services start.
            .then(() => {
                if (cfg.isProduction) {
                    logger.logWarn(`\n
                =============================================================
                CURRENT ENVIRONMENT SETTINGS CORRESPONDS TO: PRODUCTION SITE.
                =============================================================\n`)
                }

                logger.logInfo(`Executing on folder: ${__dirname}`);
                logger.logInfo(`Executing script: ${__filename}`);
                logger.logInfo(`Server is ready and listening on port:${cfg.port}!`);
                logger.logInfo(`\n\nPropel API STARTED on "${cfg.environment}" environment.\n`);
            })
        .catch((err:any) => {
            closeHandler(err)
        })
    })
    .catch((err) => {
        closeHandler(err)
    })

function closeHandler(err:any, origin?: any, code: number = 1) {
    logger.logError(`There was an error on: "${origin}", error details are: \n${String(err)}`);
    logger.logInfo(`Exiting now with code ${code}`);
    process.exit(code);
}

process.on("unhandledRejection", closeHandler);
process.on('SIGKILL', closeHandler);
process.on('SIGINT', closeHandler);
process.on('SIGUSR1', closeHandler);
process.on('SIGUSR2', closeHandler);