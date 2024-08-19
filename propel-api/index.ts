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
import { systemJobService } from "./services/system-job-service";
import { UsageStatsSystemJob } from "./core/usage-stats-system-job";

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

        logger.logInfo("Setting up all System Jobs...")
        systemJobService.register(new UsageStatsSystemJob())
        
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

                console.log(`Executing on folder: "${__dirname}".
Executing script: "${__filename}".
Server is ready and listening on port: ${cfg.port}.
Propel started on "${cfg.environment}" environment.
Start local time is ${(new Date()).toString()}.
Powered by Node.js ${process.version}(${process.arch}) on platform ${process.platform}.`);
            })
        .catch((err:any) => {
            closeHandler(err)
        })
    })
    .catch((err) => {
        closeHandler(err)
    })

function closeHandler(err:any, origin?: any, code: number = 1) {
    let msg = ""
    let errMsg = ""

    origin = String(origin);

    if (err && typeof err == "object") {
        Object.getOwnPropertyNames(err)
            .sort((a, b) => a.localeCompare(b))
            .forEach((prop) => {
                errMsg += `- ${prop}: ${err[prop]}\r\n`
            })
    }

    msg = `There was an error on: "${origin}", error details are: \r\n${errMsg}\r\rExit code is: ${code}`
    logger.logError(msg);
    console.log(msg);
    logger.logInfo(`Exiting now with code ${code}`);
    console.log(`Exiting now with code ${code}`);
    process.exit(code);
}

process.on("unhandledRejection", closeHandler);
process.on('SIGKILL', closeHandler);
process.on('SIGINT', closeHandler);
process.on('SIGUSR1', closeHandler);
process.on('SIGUSR2', closeHandler);