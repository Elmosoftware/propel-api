// @ts-check

/**
 * Logging Service
 */
class Logger {

    constructor() {
    }

    logInfo(msg) {
        console.log(msg);
    }

    logWarn(msg) {
        console.warn(msg);
    }

    logError(err) {
        console.error(String(err));
    }
}

module.exports = new Logger();
