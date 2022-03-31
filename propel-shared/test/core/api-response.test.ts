import { APIResponse } from "../../core/api-response";

describe("APIResponse Class - Construct", () => {
    test(`"new APIResponse() With null values"`, () => {
        let error = null;
        let data = null;
        let r = new APIResponse(error, data);

        expect(Array.isArray(r.errors)).toBe(true);
        expect(Array.isArray(r.data)).toBe(true);
        expect(r.errors.length).toEqual(0);
        expect(r.data.length).toEqual(0);
    })
    test(`"new APIResponse() With undefined values"`, () => {
        let error = undefined;
        let data = undefined;
        let r = new APIResponse(error, data);

        expect(Array.isArray(r.errors)).toBe(true);
        expect(Array.isArray(r.data)).toBe(true);
        expect(r.errors.length).toEqual(0);
        expect(r.data.length).toEqual(0);
    })
    test(`"new APIResponse() With single error and single data item"`, () => {
        let error = new Error("Test Error");
        let data = "Data";
        let r = new APIResponse(error, data);

        expect(Array.isArray(r.errors)).toBe(true);
        expect(Array.isArray(r.data)).toBe(true);
        expect(r.errors.length).toEqual(1);
        expect(r.data.length).toEqual(1);
        expect(r.errors[0].message).toEqual(error.message);
        expect(r.data[0]).toEqual(data);
    })
    test(`"new APIResponse() With multiple errors and multiple data items"`, () => {
        let error = [ new Error("Test Error1"), new Error("Test Error 2")];
        let data = [{ data: "1"}, {data: "2"}];
        let r = new APIResponse(error, data);

        expect(Array.isArray(r.errors)).toBe(true);
        expect(Array.isArray(r.data)).toBe(true);
        expect(r.errors.length).toEqual(2);
        expect(r.data.length).toEqual(2);
        expect(r.errors[0].message).toEqual(error[0].message);
        expect(r.errors[1].message).toEqual(error[1].message);
        expect(r.data[0]).toBe(data[0]);
        expect(r.data[1]).toBe(data[1]);
    })
})
