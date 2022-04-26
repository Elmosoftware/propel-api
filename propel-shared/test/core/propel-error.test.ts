import { PropelError } from "../../core/propel-error";
import { Code, ErrorCodes } from "../../core/error-codes";
import exp from "constants";

describe("PropelError Class - Invalid Parameters", () => {
    test(`PropelError(null) must throw`, () => {
        expect(() => {
          //@ts-ignore
          new PropelError(null);
        }).toThrow(`cannot receive null value in the "error" parameter`);
      }),
    test(`PropelError(undefined) must throw`, () => {
        expect(() => {
          //@ts-ignore
          new PropelError(undefined);
        }).toThrow(`cannot receive null value in the "error" parameter`);
      }),
    test(`new PropelError(233.4) must throw`, () => {
        expect(() => {
          //@ts-ignore
          new PropelError(233.4);
        }).toThrow(`must receive an Error object or an error message in the "error" argument`);
      }),
    test(`new PropelError("Message", true) must throw`, () => {
        expect(() => {
          //@ts-ignore
          new PropelError("Message", true);
        }).toThrow(`optional paramater "errorCode" requires a "Code" object`);
      }),
    test(`new PropelError("Message", , "not number") must throw`, () => {
        expect(() => {
          //@ts-ignore
          new PropelError("Message", null, "not number");
        }).toThrow(`PropelError class constructor optional paramater "httpStatus" requires a numeric value`);
      }),
    test(`new PropelError("Message", , "99") must throw`, () => {
        expect(() => {
          //@ts-ignore
          new PropelError("Message", null, "99");
        }).toThrow(`PropelError class constructor optional paramater "httpStatus" requires a valid HTTP status code`);
      }),
    test(`new PropelError("Message", , "600") must throw`, () => {
        expect(() => {
          //@ts-ignore
          new PropelError("Message", null, "600");
        }).toThrow(`PropelError class constructor optional paramater "httpStatus" requires a valid HTTP status code`);
      })
})

describe("PropelError Class - Construct from Message", () => {
    test(`"new PropelError({valid message}, {default error code})"`, () => {
        let msg = "My error message"
        let e = new PropelError(msg);

        expect(e.name).toBe("PropelError");
        expect(e.message).toBe(msg);
        expect(e.stackArray).not.toBeFalsy();
        expect(e.stackArray.length).toBeGreaterThan(0);
        expect(e.errorCode).toEqual(new Code())
    })
    test(`"new PropelError({valid message}, {some standard error code})"`, () => {
        let msg = "My error message"
        let code = ErrorCodes.DuplicatedItem
        let e = new PropelError(msg, code);

        expect(e.name).toBe("PropelError");
        expect(e.message).toBe(msg);
        expect(e.stackArray).not.toBeFalsy();
        expect(e.stackArray.length).toBeGreaterThan(0);
        expect(e.errorCode).toEqual(code)
    })
    test(`"new PropelError({valid message}, {some standard error code})"`, () => {
        let msg = "My error message"
        let code = ErrorCodes.DuplicatedItem
        let e = new PropelError(msg, code);

        expect(e.name).toBe("PropelError");
        expect(e.message).toBe(msg);
        expect(e.stackArray).not.toBeFalsy();
        expect(e.stackArray.length).toBeGreaterThan(0);
        expect(e.errorCode).toEqual(code)
    })
    test(`"new PropelError({valid message}, {some standard error code}, {some valid http status})"`, () => {
        let msg = "My error message"
        let code = ErrorCodes.DuplicatedItem
        let e = new PropelError(msg, code, "400");

        expect(e.name).toBe("PropelError");
        expect(e.message).toBe(msg);
        expect(e.stackArray).not.toBeFalsy();
        expect(e.stackArray.length).toBeGreaterThan(0);
        expect(e.errorCode).toEqual(code)
        expect(e.httpStatus).toEqual("400")
    })
})

describe("PropelError Class - Construct from Error Object", () => {
    test(`"new PropelError({valid error object}, {default error code})"`, () => {
        let msg = new Error("My error message")
        let e = new PropelError(msg);

        expect(e.name).toBe("PropelError - Error");
        expect(e.message).toBe(msg.message);
        expect(e.stackArray).not.toBeFalsy();
        expect(e.stackArray.length).toBeGreaterThan(0);
        expect(e.errorCode).toEqual(new Code())
    })

    test(`"new PropelError({valid error object}, {some standard error code})"`, () => {
        let msg = new Error("My error message")
        let code = ErrorCodes.DuplicatedItem
        let e = new PropelError(msg, code);

        expect(e.name).toBe("PropelError - Error");
        expect(e.message).toBe(msg.message);
        expect(e.stackArray).not.toBeFalsy();
        expect(e.stackArray.length).toBeGreaterThan(0);
        expect(e.errorCode).toEqual(code)
    })
})
