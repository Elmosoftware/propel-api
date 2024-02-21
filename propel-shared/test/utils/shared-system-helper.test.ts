import { SharedSystemHelper } from "../../utils/shared-system-helper";

describe("SharedSystemHelper Class - isValidNumber()", () => {
    test(`isValidNumber("")`, () => {
        expect(SharedSystemHelper.isValidNumber("")).toEqual(false);
    })
    test(`isValidNumber("  ")`, () => {
        expect(SharedSystemHelper.isValidNumber("  ")).toEqual(false);
    })
    test(`isValidNumber("abc")`, () => {
        expect(SharedSystemHelper.isValidNumber("abc")).toEqual(false);
    })
    test(`isValidNumber("-")`, () => {
        expect(SharedSystemHelper.isValidNumber("-")).toEqual(false);
    })
    test(`isValidNumber("+")`, () => {
        expect(SharedSystemHelper.isValidNumber("+")).toEqual(false);
    })
    test(`isValidNumber("-123a")`, () => {
        expect(SharedSystemHelper.isValidNumber("-123a")).toEqual(false);
    })
    test(`isValidNumber("+")`, () => {
        expect(SharedSystemHelper.isValidNumber("")).toEqual(false);
    })
    test(`isValidNumber("123.4-")`, () => {
        expect(SharedSystemHelper.isValidNumber("123.4-")).toEqual(false);
    })
})
