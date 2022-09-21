// @ts-check
import { EventLogger as NWEventLogger } from "node-windows";

import { Logger } from "../../propel-shared/services/logger-service";
import { cfg, LogLevel } from "../core/config";

/**
 * Extended logging class persisting logs in the Windows Event log.
 */
export class EventLogger extends Logger {

    private evLog: NWEventLogger;
    private isProd: boolean;

    constructor() {
        super();
        this.isProd = cfg.isProduction;
        this.evLog = new NWEventLogger({
            source: cfg.logSource,
            eventLog: cfg.logName
          });
    }

    /**
     * Log an informational message. If actual log level is not DEBUG or INFO this method will 
     * not perform any action.
     * @param msg Message to log.
     */
    logInfo(msg: string) {
        msg = this.timestamp() + msg;
        let print: boolean = (cfg.logLevel.toString().toLowerCase() == LogLevel.Info.toString().toLowerCase() || 
        cfg.logLevel.toString().toLowerCase() == LogLevel.Debug.toString().toLowerCase())
        super.logInfo((print) ? msg : "");
    }

    /**
     * Log a information important for debugging purposes. If actual log level is not DEBUG 
     * this method will not perform any action.
     * @param msg Message to log.
     */
    logDebug(msg: string) {
        msg = this.timestamp() + msg;
        let print: boolean = (cfg.logLevel.toString().toLowerCase() == LogLevel.Debug.toString().toLowerCase());
        super.logInfo((print) ? msg : "");
    }

    /**
     * Logs a warning message. In production environment is going to try logging to the configured 
     * Windows event log source.
     * @param msg Message to log.
     */
    logWarn(msg:string) {
        msg = this.timestamp() + msg;
        super.logWarn(msg);

        if(!this.isProd) return;
        
        this.evLog.warn(msg, undefined, _ => {
            super.logWarn(`EventLogger fails persisting this in the windows Event log. 
            The provided warning is: "${String(msg)}".`);
        });
    }

    /**
     * Log an error details.In production environment is going to try logging to the configured 
     * Windows event log source.
     * @param err Error to log.
     */
    logError(err: Error | string) {
        super.logError(err);
        
        if(!this.isProd) return;

        this.evLog.error(this.errorToString(err), undefined, (e) => {
            super.logWarn(`EventLogger fails persisting this in the windows Event log. The provided error is: "${String(e)}".`);
        });
    }

    private errorToString(e: Error | string) :string {

        let ret: string = this.timestamp();

        if (!e) return ret;

        if (typeof e == "string") {
            ret += e;
        }
        else {
             ret += `${((e as Error).name) ? (e as Error).name : "Error"}: 
${((e as Error).message) ? (e as Error).message : ""}
Stack trace:
${((e as Error).stack) ? (e as Error).stack : "Stack trace is not available."}`;
        }

        return ret;
    }

    private timestamp(): string {
        let d: Date = new Date();

        return d.getFullYear().toString() + "-" + 
            (d.getMonth()+ 1 + 100).toString().slice(1) + "-" + 
            (d.getDate() + 100).toString().slice(1) + " " + 
            (d.getHours() + 100).toString().slice(1) + ":" + 
            (d.getMinutes() + 100).toString().slice(1) + ":" + 
            (d.getSeconds() + 100).toString().slice(1) + "." + 
            d.getMilliseconds() + " -> "
    }
}

export let logger = new EventLogger();