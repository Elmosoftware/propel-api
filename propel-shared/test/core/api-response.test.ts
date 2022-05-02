import { APIResponse } from "../../core/api-response";

describe("APIResponse Class - Construct", () => {
    test(`"new APIResponse() With null values"`, () => {
        let error = null;
        let data = null;
        let r = new APIResponse(error, data);

        expect(r.error).toBe(null);
        expect(Array.isArray(r.data)).toBe(true);
        expect(r.data.length).toEqual(0);
    })
    test(`"new APIResponse() With undefined values"`, () => {
        let error = undefined;
        let data = undefined;
        let r = new APIResponse(error, data);

        expect(Array.isArray(r.data)).toBe(true);
        expect(r.error).toBe(undefined);
        expect(r.data.length).toEqual(0);
    })
    test(`"new APIResponse() With single error and single data item"`, () => {
        let error = new Error("Test Error");
        let data = "Data";
        let r = new APIResponse(error, data);

        expect(Array.isArray(r.data)).toBe(true);
        expect(r.error.message).toEqual(error.message);
        expect(r.data.length).toEqual(1);
        expect(r.data[0]).toEqual(data);
    })
})
