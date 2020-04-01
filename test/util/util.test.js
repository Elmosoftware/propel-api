const Utils = require("../../util/utils");

describe("Utils Class - isObject()", () => {

    test(`isObject(null)`, () => {
        expect(Utils.isObject(null)).toEqual(false);
    })
    test(`isObject(undefined)`, () => {
        expect(Utils.isObject(undefined)).toEqual(false);
    })
    test(`isObject(123)`, () => {
        expect(Utils.isObject(123)).toEqual(false);
    })
    test(`isObject(123.45)`, () => {
        expect(Utils.isObject(123.45)).toEqual(false);
    })
    test(`isObject(true)`, () => {
        expect(Utils.isObject(true)).toEqual(false);
    })
    test(`isObject(false)`, () => {
        expect(Utils.isObject(false)).toEqual(false);
    })
    test(`isObject(new Date())`, () => {
        expect(Utils.isObject(new Date())).toEqual(true);
    })
    test(`isObject([])`, () => {
        expect(Utils.isObject([])).toEqual(true);
    })
    test(`isObject("")`, () => {
        expect(Utils.isObject("")).toEqual(false);
    })
    test(`isObject("sample string")`, () => {
        expect(Utils.isObject("sample string")).toEqual(false);
    })
    test(`isObject(9999999999n)`, () => {
        expect(Utils.isObject(9999999999n)).toEqual(false);
    })
    test(`isObject({})`, () => {
        expect(Utils.isObject({})).toEqual(true);
    })
    test(`isObject({attr: "Hello!"})`, () => {
        expect(Utils.isObject({attr: "Hello!"})).toEqual(true);
    })
})

describe("Utils Class - isEmptyObject()", () => {

    test(`isEmptyObject(null)`, () => {
        expect(Utils.isEmptyObject(null)).toEqual(false);
    })
    test(`isEmptyObject(undefined)`, () => {
        expect(Utils.isEmptyObject(undefined)).toEqual(false);
    })
    test(`isEmptyObject(123)`, () => {
        expect(Utils.isEmptyObject(123)).toEqual(false);
    })
    test(`isEmptyObject(123.45)`, () => {
        expect(Utils.isEmptyObject(123.45)).toEqual(false);
    })
    test(`isEmptyObject(true)`, () => {
        expect(Utils.isEmptyObject(true)).toEqual(false);
    })
    test(`isEmptyObject(false)`, () => {
        expect(Utils.isEmptyObject(false)).toEqual(false);
    })
    test(`isEmptyObject(new Date())`, () => {
        expect(Utils.isEmptyObject(new Date())).toEqual(true);
    })
    test(`isEmptyObject([])`, () => {
        expect(Utils.isEmptyObject([])).toEqual(true);
    })
    test(`isEmptyObject("")`, () => {
        expect(Utils.isEmptyObject("")).toEqual(false);
    })
    test(`isEmptyObject("sample string")`, () => {
        expect(Utils.isEmptyObject("sample string")).toEqual(false);
    })
    test(`isEmptyObject(9999999999n)`, () => {
        expect(Utils.isEmptyObject(9999999999n)).toEqual(false);
    })
    test(`isEmptyObject({})`, () => {
        expect(Utils.isEmptyObject({})).toEqual(true);
    })
    test(`isEmptyObject({attr: "Hello!"})`, () => {
        expect(Utils.isEmptyObject({attr: "Hello!"})).toEqual(false);
    })
})

describe("Utils Class - defaultIfEmptyObject()", () => {

    test(`defaultIfEmptyObject(null)`, () => {
        expect(Utils.defaultIfEmptyObject(null, { testOk: true })).toEqual(null);
    })
    test(`defaultIfEmptyObject({})`, () => {
        expect(Utils.defaultIfEmptyObject({}, { testOk: true })).toEqual({ testOk: true });
    })
    test(`defaultIfEmptyObject(undefined)`, () => {
        expect(Utils.defaultIfEmptyObject(undefined)).toEqual(undefined);
    })
    test(`defaultIfEmptyObject(123)`, () => {
        expect(Utils.defaultIfEmptyObject(123)).toEqual(123);
    })
    test(`defaultIfEmptyObject(123.45)`, () => {
        expect(Utils.defaultIfEmptyObject(123.45)).toEqual(123.45);
    })
    test(`defaultIfEmptyObject(true)`, () => {
        expect(Utils.defaultIfEmptyObject(true)).toEqual(true);
    })
    test(`defaultIfEmptyObject(false)`, () => {
        expect(Utils.defaultIfEmptyObject(false)).toEqual(false);
    })
    test(`defaultIfEmptyObject(new Date())`, () => {
        var d = new Date()
        expect(Utils.defaultIfEmptyObject(d)).toEqual(null);
    })
    test(`defaultIfEmptyObject([])`, () => {
        expect(Utils.defaultIfEmptyObject([])).toEqual(null);
    })
    test(`defaultIfEmptyObject("")`, () => {
        expect(Utils.defaultIfEmptyObject("")).toEqual("");
    })
    test(`defaultIfEmptyObject("sample string")`, () => {
        expect(Utils.defaultIfEmptyObject("sample string")).toEqual("sample string");
    })
    test(`defaultIfEmptyObject(9999999999n)`, () => {
        expect(Utils.defaultIfEmptyObject(9999999999n)).toEqual(9999999999n);
    })
    test(`defaultIfEmptyObject({})`, () => {
        expect(Utils.defaultIfEmptyObject({})).toEqual(null);
    })
    test(`defaultIfEmptyObject({attr: "Hello!"})`, () => {
        expect(Utils.defaultIfEmptyObject({attr: "Hello!"})).toEqual({attr: "Hello!"});
    })
})