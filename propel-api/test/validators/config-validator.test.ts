import { cfgVal } from "../../validators/config-validator";

function setAllValid() {
    process.env.NODE_ENV = "development"
    process.env.PORT = "3000"
    process.env.DB_ENDPOINT = "mongodb://localhost:27017/propel-api"
    process.env.ENCRYPTION_KEY = "2129B972482115C8CEBEB4180F362D3BEEFAE97CE5D61F54F36D6628AE8745CC"
    process.env.PS_SCRIPT_PROPEL_PARAM = "Propel"
    process.env.MODELS_FOLDER = "models"
    process.env.POOL_MAX_SIZE="40"
    process.env.POOL_PRE_ALLOC="10"
    process.env.POOL_QUEUE_SIZE="5"
    process.env.MAX_WORKFLOW_RESULTS_SIZE="12582912"
    process.env.EXECUTIONLOG_RETENTION_DAYS="30"
    process.env.USAGE_STATS_STALE_MINUTES="30"
    process.env.UPLOAD_PAYLOAD_LIMIT_MB="0"
}

describe("ConfigValidator Class", () => {

    beforeEach(() => {
        setAllValid();
    })

    test(`Valid Configuration`, () => {
        expect(cfgVal.validate().isValid).toBe(true);
        cfgVal.reset();
    }),
    test(`Invalid NODE_ENV as a null value`, () => {
        //@ts-ignore
        process.env.NODE_ENV = null 
        cfgVal.validate()
        expect(cfgVal.isValid).toBe(false)
        //@ts-ignore
        expect(cfgVal.getErrors().message).not.toBeFalsy();
        //@ts-ignore
        expect(cfgVal.getErrors().message).toContain("NODE_ENV is missing or it has an invalid value");
        cfgVal.reset();
    }),
    test(`Invalid NODE_ENV as an invalid environment`, () => {
        process.env.NODE_ENV = "invalid environment"
        cfgVal.validate()
        expect(cfgVal.isValid).toBe(false)
        //@ts-ignore
        expect(cfgVal.getErrors().message).not.toBeFalsy();
        //@ts-ignore
        expect(cfgVal.getErrors().message).toContain("NODE_ENV is missing or it has an invalid value");
        cfgVal.reset();
    }),
    test(`Invalid PORT as a null value`, () => {
        process.env.PORT = ""
        cfgVal.validate()
        expect(cfgVal.isValid).toBe(false)
        //@ts-ignore
        expect(cfgVal.getErrors().message).not.toBeFalsy();
        //@ts-ignore
        expect(cfgVal.getErrors().message).toContain("PORT is required");
        cfgVal.reset();
    }),
    test(`Invalid PORT as NaN`, () => {
        process.env.PORT = "not a port number"
        cfgVal.validate()
        expect(cfgVal.isValid).toBe(false)
        //@ts-ignore
        expect(cfgVal.getErrors().message).not.toBeFalsy();
        //@ts-ignore
        expect(cfgVal.getErrors().message).toContain("PORT is not a number or is out of the range of valid TCP registered ports");
        cfgVal.reset();
    }),
    test(`Invalid PORT as lower than min registered port`, () => {
        process.env.PORT = "80"
        cfgVal.validate()
        expect(cfgVal.isValid).toBe(false)
        //@ts-ignore
        expect(cfgVal.getErrors().message).not.toBeFalsy();
        //@ts-ignore
        expect(cfgVal.getErrors().message).toContain("PORT is not a number or is out of the range of valid TCP registered ports");
        cfgVal.reset();
    }),
    test(`Invalid PORT as higher than max registered port`, () => {
        process.env.PORT = "50000"
        cfgVal.validate()
        expect(cfgVal.isValid).toBe(false)
        //@ts-ignore
        expect(cfgVal.getErrors().message).not.toBeFalsy();
        //@ts-ignore
        expect(cfgVal.getErrors().message).toContain("PORT is not a number or is out of the range of valid TCP registered ports");
        cfgVal.reset();
    }),
    test(`Invalid DB_ENDPOINT as an empty string`, () => {
        process.env.DB_ENDPOINT = ""
        cfgVal.validate()
        expect(cfgVal.isValid).toBe(false)
        //@ts-ignore
        expect(cfgVal.getErrors().message).not.toBeFalsy();
        //@ts-ignore
        expect(cfgVal.getErrors().message).toContain("DB_ENDPOINT is required");
        cfgVal.reset();
    })
    test(`Invalid POOL_MAX_SIZE as an empty string`, () => {
        process.env.POOL_MAX_SIZE = ""
        cfgVal.validate()
        expect(cfgVal.isValid).toBe(false)
        //@ts-ignore
        expect(cfgVal.getErrors().message).not.toBeFalsy();
        //@ts-ignore
        expect(cfgVal.getErrors().message).toContain("POOL_MAX_SIZE is required.");
        cfgVal.reset();
    })
    test(`Invalid POOL_MAX_SIZE as a number less than zero`, () => {
        process.env.POOL_MAX_SIZE = "-3"
        cfgVal.validate()
        expect(cfgVal.isValid).toBe(false)
        //@ts-ignore
        expect(cfgVal.getErrors().message).not.toBeFalsy();
        //@ts-ignore
        expect(cfgVal.getErrors().message).toContain("POOL_MAX_SIZE is not a number or is less than zero.");
        cfgVal.reset();
    })
    test(`Invalid POOL_PRE_ALLOC as an empty string`, () => {
        process.env.POOL_PRE_ALLOC = ""
        cfgVal.validate()
        expect(cfgVal.isValid).toBe(false)
        //@ts-ignore
        expect(cfgVal.getErrors().message).not.toBeFalsy();
        //@ts-ignore
        expect(cfgVal.getErrors().message).toContain("POOL_PRE_ALLOC is required.");
        cfgVal.reset();
    })
    test(`Invalid POOL_PRE_ALLOC as a number less than zero`, () => {
        process.env.POOL_PRE_ALLOC = "-3"
        cfgVal.validate()
        expect(cfgVal.isValid).toBe(false)
        //@ts-ignore
        expect(cfgVal.getErrors().message).not.toBeFalsy();
        //@ts-ignore
        expect(cfgVal.getErrors().message).toContain("POOL_PRE_ALLOC is not a number, is less than zero or greater to POOL_MAX_SIZE");
        cfgVal.reset();
    })
    test(`Invalid POOL_PRE_ALLOC as a number higher than POOL_MAX_SIZE`, () => {
        process.env.POOL_MAX_SIZE = "10"
        process.env.POOL_PRE_ALLOC = "20"
        cfgVal.validate()
        expect(cfgVal.isValid).toBe(false)
        //@ts-ignore
        expect(cfgVal.getErrors().message).not.toBeFalsy();
        //@ts-ignore
        expect(cfgVal.getErrors().message).toContain("POOL_PRE_ALLOC is not a number, is less than zero or greater to POOL_MAX_SIZE");
        cfgVal.reset();
    })
    test(`Invalid POOL_QUEUE_SIZE as an empty string`, () => {
        process.env.POOL_QUEUE_SIZE = ""
        cfgVal.validate()
        expect(cfgVal.isValid).toBe(false)
        //@ts-ignore
        expect(cfgVal.getErrors().message).not.toBeFalsy();
        //@ts-ignore
        expect(cfgVal.getErrors().message).toContain("POOL_QUEUE_SIZE is required.");
        cfgVal.reset();
    })
    test(`Invalid POOL_QUEUE_SIZE as a number less than zero`, () => {
        process.env.POOL_QUEUE_SIZE = "-3"
        cfgVal.validate()
        expect(cfgVal.isValid).toBe(false)
        //@ts-ignore
        expect(cfgVal.getErrors().message).not.toBeFalsy();
        //@ts-ignore
        expect(cfgVal.getErrors().message).toContain("POOL_QUEUE_SIZE is not a number or is less than zero.");
        cfgVal.reset();
    })
    test(`Invalid MAX_WORKFLOW_RESULTS_SIZE as a null value`, () => {
        //@ts-ignore
        process.env.MAX_WORKFLOW_RESULTS_SIZE = ""
        cfgVal.validate()
        expect(cfgVal.isValid).toBe(false)
        //@ts-ignore
        expect(cfgVal.getErrors().message).not.toBeFalsy();
        //@ts-ignore
        expect(cfgVal.getErrors().message).toContain("MAX_WORKFLOW_RESULTS_SIZE is required");
        cfgVal.reset();
    })
    test(`Invalid MAX_WORKFLOW_RESULTS_SIZE as a non-numeric value`, () => {
        //@ts-ignore
        process.env.MAX_WORKFLOW_RESULTS_SIZE = "ABC"
        cfgVal.validate()
        expect(cfgVal.isValid).toBe(false)
        //@ts-ignore
        expect(cfgVal.getErrors().message).not.toBeFalsy();
        //@ts-ignore
        expect(cfgVal.getErrors().message).toContain("MAX_WORKFLOW_RESULTS_SIZE is not a number or it has a negative value");
        cfgVal.reset();
    })
    test(`Invalid MAX_WORKFLOW_RESULTS_SIZE as a negative value`, () => {
        //@ts-ignore
        process.env.MAX_WORKFLOW_RESULTS_SIZE = "-1"
        cfgVal.validate()
        expect(cfgVal.isValid).toBe(false)
        //@ts-ignore
        expect(cfgVal.getErrors().message).not.toBeFalsy();
        //@ts-ignore
        expect(cfgVal.getErrors().message).toContain("MAX_WORKFLOW_RESULTS_SIZE is not a number or it has a negative value");
        cfgVal.reset();
    })
    test(`Missing PS_SCRIPT_PROPEL_PARAM value`, () => {
        //@ts-ignore
        process.env.PS_SCRIPT_PROPEL_PARAM = ""
        cfgVal.validate()
        expect(cfgVal.isValid).toBe(false)
        //@ts-ignore
        expect(cfgVal.getErrors().message).not.toBeFalsy();
        //@ts-ignore
        expect(cfgVal.getErrors().message).toContain(`PS_SCRIPT_PROPEL_PARAM is required`);
        cfgVal.reset();
    })
    test(`Missing ENCRYPTION_KEY value`, () => {
        //@ts-ignore
        process.env.ENCRYPTION_KEY = ""
        cfgVal.validate()
        expect(cfgVal.isValid).toBe(false)
        //@ts-ignore
        expect(cfgVal.getErrors().message).not.toBeFalsy();
        //@ts-ignore
        expect(cfgVal.getErrors().message).toContain(`ENCRYPTION_KEY is required`);
        cfgVal.reset();
    })
    test(`Invalid ENCRYPTION_KEY value`, () => {
        //@ts-ignore
        process.env.ENCRYPTION_KEY = "1234"
        cfgVal.validate()
        expect(cfgVal.isValid).toBe(false)
        //@ts-ignore
        expect(cfgVal.getErrors().message).not.toBeFalsy();
        //@ts-ignore
        expect(cfgVal.getErrors().message).toContain(`ENCRYPTION_KEY is required`);
        cfgVal.reset();
    })
    test(`Missing EXECUTIONLOG_RETENTION_DAYS value`, () => {
        //@ts-ignore
        process.env.EXECUTIONLOG_RETENTION_DAYS = ""
        cfgVal.validate()
        expect(cfgVal.isValid).toBe(false)
        //@ts-ignore
        expect(cfgVal.getErrors().message).not.toBeFalsy();
        //@ts-ignore
        expect(cfgVal.getErrors().message).toContain(`EXECUTIONLOG_RETENTION_DAYS is required`);
        cfgVal.reset();
    })
    test(`Invalid EXECUTIONLOG_RETENTION_DAYS value`, () => {
        //@ts-ignore
        process.env.EXECUTIONLOG_RETENTION_DAYS = "Invalid"
        cfgVal.validate()
        expect(cfgVal.isValid).toBe(false)
        //@ts-ignore
        expect(cfgVal.getErrors().message).not.toBeFalsy();
        //@ts-ignore
        expect(cfgVal.getErrors().message).toContain(`EXECUTIONLOG_RETENTION_DAYS is not a number or it has a value less or equal to zero`);
        cfgVal.reset();
    })
    test(`Invalid EXECUTIONLOG_RETENTION_DAYS numeric value (0)`, () => {
        //@ts-ignore
        process.env.EXECUTIONLOG_RETENTION_DAYS = "0"
        cfgVal.validate()
        expect(cfgVal.isValid).toBe(false)
        //@ts-ignore
        expect(cfgVal.getErrors().message).not.toBeFalsy();
        //@ts-ignore
        expect(cfgVal.getErrors().message).toContain(`EXECUTIONLOG_RETENTION_DAYS is not a number or it has a value less or equal to zero`);
        cfgVal.reset();
    })
    test(`Invalid EXECUTIONLOG_RETENTION_DAYS numeric value (-1)`, () => {
        //@ts-ignore
        process.env.EXECUTIONLOG_RETENTION_DAYS = "-1"
        cfgVal.validate()
        expect(cfgVal.isValid).toBe(false)
        //@ts-ignore
        expect(cfgVal.getErrors().message).not.toBeFalsy();
        //@ts-ignore
        expect(cfgVal.getErrors().message).toContain(`EXECUTIONLOG_RETENTION_DAYS is not a number or it has a value less or equal to zero`);
        cfgVal.reset();
    })
    test(`Missing USAGE_STATS_STALE_MINUTES value`, () => {
        //@ts-ignore
        process.env.USAGE_STATS_STALE_MINUTES = ""
        cfgVal.validate()
        expect(cfgVal.isValid).toBe(false)
        //@ts-ignore
        expect(cfgVal.getErrors().message).not.toBeFalsy();
        //@ts-ignore
        expect(cfgVal.getErrors().message).toContain(`USAGE_STATS_STALE_MINUTES is required`);
        cfgVal.reset();
    })
    test(`Invalid USAGE_STATS_STALE_MINUTES value`, () => {
        //@ts-ignore
        process.env.USAGE_STATS_STALE_MINUTES = "Invalid"
        cfgVal.validate()
        expect(cfgVal.isValid).toBe(false)
        //@ts-ignore
        expect(cfgVal.getErrors().message).not.toBeFalsy();
        //@ts-ignore
        expect(cfgVal.getErrors().message).toContain(`USAGE_STATS_STALE_MINUTES is not a number or it has a value less than zero`);
        cfgVal.reset();
    })
    test(`Invalid USAGE_STATS_STALE_MINUTES numeric value (-1)`, () => {
        //@ts-ignore
        process.env.USAGE_STATS_STALE_MINUTES = "-1"
        cfgVal.validate()
        expect(cfgVal.isValid).toBe(false)
        //@ts-ignore
        expect(cfgVal.getErrors().message).not.toBeFalsy();
        //@ts-ignore
        expect(cfgVal.getErrors().message).toContain(`USAGE_STATS_STALE_MINUTES is not a number or it has a value less than zero`);
        cfgVal.reset();
    })
    test(`Missing UPLOAD_PAYLOAD_LIMIT_MB value`, () => {
        //@ts-ignore
        process.env.UPLOAD_PAYLOAD_LIMIT_MB = ""
        cfgVal.validate()
        expect(cfgVal.isValid).toBe(false)
        //@ts-ignore
        expect(cfgVal.getErrors().message).not.toBeFalsy();
        //@ts-ignore
        expect(cfgVal.getErrors().message).toContain(`UPLOAD_PAYLOAD_LIMIT_MB is required`);
        cfgVal.reset();
    })
    test(`Invalid UPLOAD_PAYLOAD_LIMIT_MB value`, () => {
        //@ts-ignore
        process.env.UPLOAD_PAYLOAD_LIMIT_MB = "Invalid"
        cfgVal.validate()
        expect(cfgVal.isValid).toBe(false)
        //@ts-ignore
        expect(cfgVal.getErrors().message).not.toBeFalsy();
        //@ts-ignore
        expect(cfgVal.getErrors().message).toContain(`UPLOAD_PAYLOAD_LIMIT_MB is not a number or is less than zero or`);
        cfgVal.reset();
    })
    test(`Invalid UPLOAD_PAYLOAD_LIMIT_MB numeric value (-1)`, () => {
        //@ts-ignore
        process.env.UPLOAD_PAYLOAD_LIMIT_MB = "-1"
        cfgVal.validate()
        expect(cfgVal.isValid).toBe(false)
        //@ts-ignore
        expect(cfgVal.getErrors().message).not.toBeFalsy();
        //@ts-ignore
        expect(cfgVal.getErrors().message).toContain(`UPLOAD_PAYLOAD_LIMIT_MB is not a number or is less than zero or`);
        cfgVal.reset();
    })
    test(`Invalid UPLOAD_PAYLOAD_LIMIT_MB numeric value (101)`, () => {
        //@ts-ignore
        process.env.UPLOAD_PAYLOAD_LIMIT_MB = "101"
        cfgVal.validate()
        expect(cfgVal.isValid).toBe(false)
        //@ts-ignore
        expect(cfgVal.getErrors().message).not.toBeFalsy();
        //@ts-ignore
        expect(cfgVal.getErrors().message).toContain(`UPLOAD_PAYLOAD_LIMIT_MB is not a number or is less than zero or`);
        cfgVal.reset();
    })
})
