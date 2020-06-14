import { PropelError } from "../../core/propel-error";
import { Code, ErrorCodes } from "../../core/error-codes";

describe("PropelError Class - Invalid Parameters", () => {
    test(`"PropelError(null)" must throw`, () => {
        expect(() => {
          //@ts-ignore
          new PropelError(null);
        }).toThrow(`cannot receive null value in the "error" parameter`);
      }),
    test(`"PropelError(undefined)" must throw`, () => {
        expect(() => {
          //@ts-ignore
          new PropelError(undefined);
        }).toThrow(`cannot receive null value in the "error" parameter`);
      }),
    test(`"new PropelError(233.4)" must throw`, () => {
        expect(() => {
          //@ts-ignore
          new PropelError(233.4);
        }).toThrow(`must receive an Error object or an error message in the "error" argument`);
      }),
    test(`"new PropelError("Message", true)" must throw`, () => {
        expect(() => {
          //@ts-ignore
          new PropelError("Message", true);
        }).toThrow(`optional paramater "errorCode" requires a "Code" object`);
      })
})

describe("PropelError Class - Construct from Message", () => {
    test(`"new PropelError({valid message}, {default error code})"`, () => {
        let msg = "My error message"
        let e = new PropelError(msg);

        expect(e.name).toBe("PropelError");
        expect(e.message).toBe(msg);
        expect(e.stack).not.toBeFalsy();
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
        expect(e.stack).not.toBeFalsy();
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
        expect(e.stack).not.toBeFalsy();
        expect(e.stackArray).not.toBeFalsy();
        expect(e.stackArray.length).toBeGreaterThan(0);
        expect(e.errorCode).toEqual(code)
    })
})

describe("PropelError Class - Construct from Error Object", () => {
    test(`"new PropelError({valid error object}, {default error code})"`, () => {
        let msg = new Error("My error message")
        let e = new PropelError(msg);

        expect(e.name).toBe("PropelError - Error");
        expect(e.message).toBe(msg.message);
        expect(e.stack).not.toBeFalsy();
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
        expect(e.stack).not.toBeFalsy();
        expect(e.stackArray).not.toBeFalsy();
        expect(e.stackArray.length).toBeGreaterThan(0);
        expect(e.errorCode).toEqual(code)
    })
})
