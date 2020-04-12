// @ts-check

/**
 * Logging Service
 */
export class Logger {

    constructor() {
    }

    logInfo(msg: string) {
        console.log(msg);
    }

    logWarn(msg:string) {
        console.warn(msg);
    }

    logError(err: Error | string) {
        console.error(String(err));
    }
}

export let logger = new Logger();