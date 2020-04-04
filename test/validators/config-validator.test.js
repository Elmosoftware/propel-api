const cv = require("../../validators/config-validator");

function setAllValid() {
    process.env.NODE_ENV = "development"
    process.env.PORT = 3000
    process.env.DB_ENDPOINT = "mongodb://localhost:27017/propel-api"
    process.env.MODELS_FOLDER = "models"
}

describe("ConfigValidator Class", () => {

    beforeEach(() => {
        setAllValid();
    })

    test(`Valid Configuration`, () => {
        expect(cv.validate().isValid).toBe(true)
    }),
    test(`Invalid NODE_ENV as a null value`, () => {
        process.env.NODE_ENV = null
        cv.validate()
        expect(cv.isValid).toBe(false)
        expect(cv.getErrors().message).not.toBeFalsy();
        expect(cv.getErrors().message).toContain("NODE_ENV is missing or it has an invalid value");
    }),
    test(`Invalid NODE_ENV as an invalid environment`, () => {
        process.env.NODE_ENV = "invalid environment"
        cv.validate()
        expect(cv.isValid).toBe(false)
        expect(cv.getErrors().message).not.toBeFalsy();
        expect(cv.getErrors().message).toContain("NODE_ENV is missing or it has an invalid value");
    }),
    test(`Invalid PORT as a null value`, () => {
        process.env.PORT = ""
        cv.validate()
        expect(cv.isValid).toBe(false)
        expect(cv.getErrors().message).not.toBeFalsy();
        expect(cv.getErrors().message).toContain("PORT is required");
    }),
    test(`Invalid PORT as NaN`, () => {
        process.env.PORT = "not a port number"
        cv.validate()
        expect(cv.isValid).toBe(false)
        expect(cv.getErrors().message).not.toBeFalsy();
        expect(cv.getErrors().message).toContain("PORT is not a number or is out of the range of valid TCP registered ports");
    }),
    test(`Invalid PORT as lower than min registered port`, () => {
        process.env.PORT = "80"
        cv.validate()
        expect(cv.isValid).toBe(false)
        expect(cv.getErrors().message).not.toBeFalsy();
        expect(cv.getErrors().message).toContain("PORT is not a number or is out of the range of valid TCP registered ports");
    }),
    test(`Invalid PORT as higher than max registered port`, () => {
        process.env.PORT = "50000"
        cv.validate()
        expect(cv.isValid).toBe(false)
        expect(cv.getErrors().message).not.toBeFalsy();
        expect(cv.getErrors().message).toContain("PORT is not a number or is out of the range of valid TCP registered ports");
    }),
    test(`Invalid DB_ENDPOINT as an empty string`, () => {
        process.env.DB_ENDPOINT = ""
        cv.validate()
        expect(cv.isValid).toBe(false)
        expect(cv.getErrors().message).not.toBeFalsy();
        expect(cv.getErrors().message).toContain("DB_ENDPOINT is required");
    })
})
