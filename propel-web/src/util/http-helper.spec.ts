import { HttpHelper, Protocol, Headers } from "./http-helper";

describe("HttpHelper Class", () => {

    describe("buildURL()", () => {
        it("When no protocol or base URL is provided must return and empty string", () => {
            //@ts-ignore
            expect(HttpHelper.buildURL("", "")).toEqual("");
        });
        it("When valid protocol and base url it must return a wellformed URL", () => {
            expect(HttpHelper.buildURL(Protocol.HTTP, "propel.com")).toEqual("http://propel.com");
        });
        it("When valid protocol and base url it must return a wellformed URL (removing trailing slashes)", () => {
            expect(HttpHelper.buildURL(Protocol.HTTP, "propel.com/")).toEqual("http://propel.com");
        });
        it("When valid protocol and base url it must return a wellformed URL (removing multiple trailing slashes)", () => {
            expect(HttpHelper.buildURL(Protocol.HTTP, "propel.com////")).toEqual("http://propel.com");
        });
        it("When valid protocol, base url and string path must return a wellformed URL", () => {
            expect(HttpHelper.buildURL(Protocol.HTTP, "propel.com", "path1")).toEqual("http://propel.com/path1");
        });
        it("When valid protocol, base url and string array path must return a wellformed URL", () => {
            expect(HttpHelper.buildURL(Protocol.HTTP, "propel.com/", ["path1", "path2", "path3"])).toEqual("http://propel.com/path1/path2/path3");
        });
        it("When valid protocol, base url and string array of mixed paths must return a wellformed URL", () => {
            expect(HttpHelper.buildURL(Protocol.HTTP, "propel.com", ["path1", "path2/otherpath2", "path3/path4"])).toEqual("http://propel.com/path1/path2/otherpath2/path3/path4");
        });
        it("When valid protocol, base url. No path but a query string must return a wellformed URL", () => {
            let q = new URLSearchParams({q1: "q1value", q2: "q2value"})
            expect(HttpHelper.buildURL(Protocol.HTTP, "propel.com", "", q)).toEqual("http://propel.com?q1=q1value&q2=q2value");
        });
        it("When valid protocol, base url, path and a query string must return a wellformed URL", () => {
            let q = new URLSearchParams({q1: "q1value", q2: "q2value"})
            expect(HttpHelper.buildURL(Protocol.HTTP, "propel.com", ["path1", "path2"], q)).toEqual("http://propel.com/path1/path2?q1=q1value&q2=q2value");
        });
    });
    describe("buildHeaders()", () => {
        it("When no header is provided must return no headers", () => {
            //@ts-ignore
            let h = HttpHelper.buildHeaders();
            expect(h.keys().length).toEqual(0);
        });
    });
    describe("buildHeaders()", () => {
        it("One header with single value", () => {
            //@ts-ignore
            let h = HttpHelper.buildHeaders({name: "Header1", value: "Value1"});
            expect(h.keys().length).toEqual(1);
            expect(h.getAll("Header1").length).toEqual(1);
            expect(h.getAll("Header1")[0]).toEqual("Value1");
        });
    });
    describe("buildHeaders()", () => {
        it("One header with multiple values", () => {
            //@ts-ignore
            let h = HttpHelper.buildHeaders({name: "Header1", value: ["Value11", "Value12", "Value13"]});
            expect(h.keys().length).toEqual(1);
            expect(h.getAll("Header1").length).toEqual(3);
            expect(h.getAll("Header1")[0]).toEqual("Value11");
            expect(h.getAll("Header1")[1]).toEqual("Value12");
            expect(h.getAll("Header1")[2]).toEqual("Value13");
        });
    });
    describe("buildHeaders()", () => {
        it("Multiple headers with single values", () => {
            //@ts-ignore
            let h = HttpHelper.buildHeaders({ name: "Header1", value: "Value1" },
                { name: "Header2", value: "Value2" },
                { name: "Header3", value: "Value3" });
            expect(h.keys().length).toEqual(3);
            expect(h.getAll("Header1").length).toEqual(1);
            expect(h.getAll("Header1")[0]).toEqual("Value1");
            expect(h.getAll("Header2").length).toEqual(1);
            expect(h.getAll("Header2")[0]).toEqual("Value2");
            expect(h.getAll("Header3").length).toEqual(1);
            expect(h.getAll("Header3")[0]).toEqual("Value3");
        });
    });
    describe("buildHeaders()", () => {
        it("Multiple headers with mixed values", () => {
            //@ts-ignore
            let h = HttpHelper.buildHeaders({ name: "Header1", value: "Value1" },
                { name: "Header2", value: ["Value21", "Value22"] },
                { name: "Header3", value: "Value3" });
            expect(h.keys().length).toEqual(3);
            expect(h.getAll("Header1").length).toEqual(1);
            expect(h.getAll("Header1")[0]).toEqual("Value1");
            expect(h.getAll("Header2").length).toEqual(2);
            expect(h.getAll("Header2")[0]).toEqual("Value21");
            expect(h.getAll("Header2")[1]).toEqual("Value22");
            expect(h.getAll("Header3").length).toEqual(1);
            expect(h.getAll("Header3")[0]).toEqual("Value3");
        });
    });
    describe("buildHeaders()", () => {
        it("Trying standard headers", () => {
            //@ts-ignore
            let h = HttpHelper.buildHeaders(Headers.ContentTypeJson, 
                Headers.XPropelNoAuth);
            expect(h.keys().length).toEqual(2);
            expect(h.getAll("Content-Type").length).toEqual(1);
            expect(h.getAll("Content-Type")[0]).toEqual("application/json");
            expect(h.getAll("X-Propel-NoAuth").length).toEqual(1);
            expect(h.getAll("X-Propel-NoAuth")[0]).toEqual("");
        });
    });
});