// @ts-check

/*
    Propel API
*/

console.log(`\r\n -------------------------  Propel API ------------------------- \r\n`);
console.log(`\r\n     --------------------  Reach your servers! -------------------- \r\n`);

//Core Propel API services and helpers:
import { cfg } from "./core/config";
import { logger } from "./services/logger-service";
import { cfgVal } from "./validators/config-validator";
import { webServer } from "./core/web-server";
import { db } from "./core/database";
import { usageStatsService } from "./services/usage-stats-service";

//Configuration validation:
if (!cfgVal.validate().isValid) {
    //@ts-ignore
    logger.logWarn(`\r\n\r\nIMPORTANT: One or more configuration errors prevent the application to start:\r\n
Check the details below in order to review and remediate your ".env" file accordingly.\r\n\r\n`);
    logger.logError((cfgVal.getErrors() as Error));
    closeHandler(cfgVal.getErrors(), "Application start");
}

logger.logInfo("Propel is starting!");

db.start() //Database setup.
    .then((data: any) => {
        logger.logInfo(`Successfully connected to Mongo DB instance!`);
        logger.logDebug(`Mongo DB driver options in use:
        ${JSON.stringify(db.options)
                .replace(/,/g, "\r\n\t")
                .replace(/{/g, "")
                .replace(/}/g, "")}\r\n`);

        logger.logInfo("Triggering a usage statistics refresh...")
        usageStatsService.updateStats(); //Usage stats refresh will be 
        //triggered by the UsageStatsServices.
        logger.logInfo("Starting HTTP server...")
        webServer.start() //Web Server and routing services start.
            .then(() => {
                if (cfg.isProduction) {
                    logger.logInfo(`\r\n=============================================================
    CURRENT ENVIRONMENT SETTINGS CORRESPONDS TO: PRODUCTION SITE.
=============================================================\r\n`)
                }
                else {
                    logger.logInfo(`Propel started successfully with "${cfg.environment}" environment configuration.`);
                }

                logger.logDebug(`Executing on folder: "${__dirname}".
Executing script: "${__filename}".
Server is ready and listening on port: ${cfg.port}.
\r\nPropel started on "${cfg.environment}" environment.\r\n`);
            })
        .catch((err:any) => {
            closeHandler(err)
        })
    })
    .catch((err) => {
        closeHandler(err)
    })

function closeHandler(err:any, origin?: any, code: number = 1) {
    logger.logError(`There was an error on: "${origin}", error details are: \r\n${JSON.stringify(err)}`);
    logger.logInfo(`Exiting now with code ${code}`);
    process.exit(code);
}

process.on("unhandledRejection", closeHandler);
process.on('SIGKILL', closeHandler);
process.on('SIGINT', closeHandler);
process.on('SIGUSR1', closeHandler);
process.on('SIGUSR2', closeHandler);