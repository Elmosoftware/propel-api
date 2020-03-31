const APIError = require("../../core/api-error");
const { Code, StandardCodes } = require("../../core/api-error-codes");
const cfg = require("../../core/config")

describe("APIError Class - Invalid Parameters", () => {
    test(`"APIError(null)" must throw`, () => {
        expect(() => {
          new APIError(null);
        }).toThrow(`cannot receive null value in the "error" parameter`);
      }),
    test(`"APIError(undefined)" must throw`, () => {
        expect(() => {
          new APIError(undefined);
        }).toThrow(`cannot receive null value in the "error" parameter`);
      }),
    test(`"new APIError(233.4)" must throw`, () => {
        expect(() => {
          new APIError(233.4);
        }).toThrow(`must receive an Error object or an error message in the "error" argument`);
      }),
    test(`"new APIError("Message", true)" must throw`, () => {
        expect(() => {
          new APIError("Message", true);
        }).toThrow(`optional paramater "errorCode" requires a "Code" object`);
      })
})

describe("APIError Class - Construct from Message", () => {
    test(`"new APIError({valid message}, {default error code})"`, () => {
        let msg = "My error message"
        let e = new APIError(msg);

        expect(e.name).toBe("APIError");
        expect(e.message).toBe(msg);
        expect(e.stack).not.toBeFalsy();
        expect(e.stackArray).not.toBeFalsy();
        expect(e.stackArray.length).toBeGreaterThan(0);
        expect(e.errorCode).toEqual(new Code())
    }),
    test(`"new APIError({valid message}, {some standard error code})"`, () => {
        let msg = "My error message"
        let code = StandardCodes.DuplicatedItem
        let e = new APIError(msg, code);

        expect(e.name).toBe("APIError");
        expect(e.message).toBe(msg);
        expect(e.stack).not.toBeFalsy();
        expect(e.stackArray).not.toBeFalsy();
        expect(e.stackArray.length).toBeGreaterThan(0);
        expect(e.errorCode).toEqual(code)
    }),

    test(`"new APIError({valid message}, {some standard error code})"`, () => {
        let msg = "My error message"
        let code = StandardCodes.DuplicatedItem
        let e = new APIError(msg, code);

        expect(e.name).toBe("APIError");
        expect(e.message).toBe(msg);
        expect(e.stack).not.toBeFalsy();
        expect(e.stackArray).not.toBeFalsy();
        expect(e.stackArray.length).toBeGreaterThan(0);
        expect(e.errorCode).toEqual(code)
    }),
    test(`"new APIError({valid message}, {some standard error code}) ON PRODUCTION SITE"`, () => {
        let msg = "My error message"
        let code = StandardCodes.DuplicatedItem
        let mock = jest.spyOn(cfg, "isProduction", "get") //To emulate prod site
          .mockReturnValue(true);
        let e = new APIError(msg, code);

        expect(e.name).toBe("APIError");
        expect(e.message).toBe(msg);
        expect(e.stack).toBeFalsy(); //Stack must not be returned when in prod env.
        expect(e.stackArray).not.toBeFalsy();
        expect(e.stackArray.length).toEqual(0); //Stack must not be returned when in prod env.
        expect(e.errorCode).toEqual(code)

        mock.mockRestore();
    })
})

describe("APIError Class - Construct from Error Object", () => {
    test(`"new APIError({valid error object}, {default error code})"`, () => {
        let msg = new Error("My error message")
        let e = new APIError(msg);

        expect(e.name).toBe("APIError - Error");
        expect(e.message).toBe(msg.message);
        expect(e.stack).not.toBeFalsy();
        expect(e.stackArray).not.toBeFalsy();
        expect(e.stackArray.length).toBeGreaterThan(0);
        expect(e.errorCode).toEqual(new Code())
    })

    test(`"new APIError({valid error object}, {some standard error code})"`, () => {
        let msg = new Error("My error message")
        let code = StandardCodes.DuplicatedItem
        let e = new APIError(msg, code);

        expect(e.name).toBe("APIError - Error");
        expect(e.message).toBe(msg.message);
        expect(e.stack).not.toBeFalsy();
        expect(e.stackArray).not.toBeFalsy();
        expect(e.stackArray.length).toBeGreaterThan(0);
        expect(e.errorCode).toEqual(code)
    }),
    test(`"new APIError({valid error object}, {some standard error code}) ON PRODUCTION SITE"`, () => {
        let msg = new Error("My error message")
        let code = StandardCodes.DuplicatedItem
        let mock = jest.spyOn(cfg, "isProduction", "get") //To emulate prod site
          .mockReturnValue(true);
        let e = new APIError(msg, code);

        expect(e.name).toBe("APIError - Error");
        expect(e.message).toBe(msg.message);
        expect(e.stack).toBeFalsy(); //Stack must not be returned when in prod env.
        expect(e.stackArray).not.toBeFalsy();
        expect(e.stackArray.length).toEqual(0); //Stack must not be returned when in prod env.
        expect(e.errorCode).toEqual(code)

        mock.mockRestore();
    })
})
