// @ts-check

/**
 * Logging Service
 */
export class Logger {

    constructor() {
    }

    logInfo(msg: string) {
        if (!msg) return
        console.log(msg);
    }

    logWarn(msg:string) {
        if (!msg) return
        console.warn(msg);
    }

    logError(err: Error | string) {
        if (!err) return
        console.error(String(err));
    }
}

export let logger = new Logger();