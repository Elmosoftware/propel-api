const QueryModifier = require("../../core/query-modifier");

describe("QueryModifier Class - Invalid Parameters", () => {
    test(`"top" with invalid type`, () => {
        expect(() => {
            new QueryModifier({ top: new Object() });
        }).toThrow(`We expected a String or Number for the pagination parameter "top"`);
    })
    test(`"skip" with invalid type`, () => {
        expect(() => {
            new QueryModifier({ skip: new Object() });
        }).toThrow(`We expected a String or Number for the pagination parameter "skip"`);
    })
    test(`"top" with invalid string value`, () => {
        expect(() => {
            new QueryModifier({ top: "invalid top value"});
        }).toThrow(`The pagination parameter "top" is not a number`);
    })
    test(`"skip" with invalid string value`, () => {
        expect(() => {
            new QueryModifier({ skip: "invalid skip value"});
        }).toThrow(`The pagination parameter "skip" is not a number`);
    })
    test(`"top" with a negative numeric value`, () => {
        expect(() => {
            new QueryModifier({ top: -1});
        }).toThrow(`The pagination parameter "top" can't be negative`);
    })
    test(`"skip" with a negative numeric value`, () => {
        expect(() => {
            new QueryModifier({ skip: -1});
        }).toThrow(`The pagination parameter "skip" can't be negative`);
    })
    test(`"sortBy" with invalid type`, () => {
        expect(() => {
            new QueryModifier({ sortBy: 1 });
        }).toThrow(`We expected a String for the "sortBy" query modifier`);
    })
    test(`"filterBy" with invalid type`, () => {
        expect(() => {
            new QueryModifier({ filterBy: 1 });
        }).toThrow(`We expected a String for the "filterBy" query modifier`);
    })
    test(`"filterBy" with a non empty JSON string value`, () => {
        expect(() => {
            new QueryModifier({ filterBy: "[]"});
        }).toThrow(`We expected a valid JSON string value for the "filterBy" query modifier`);
    })
    test(`"filterBy" with a non JSON string value`, () => {
        expect(() => {
            new QueryModifier({ filterBy: "{ \"invalid\" }"});
        }).toThrow(`We got the following error when trying to parse it as json`);
    })
});

describe("QueryModifier Class - Valid and Missing Parameters", () => {
    test(`No parameters specified, (all defaults)`, () => {
        let qm = new QueryModifier({});

        expect(qm.top).toEqual(0);
        expect(qm.skip).toEqual(0);
        expect(qm.sortBy).toEqual("");
        expect(qm.populate).toBe(true);
        expect(qm.filterBy).toEqual("{}");
    })

    test(`All parameters specified, (no defaults)`, () => {
        let qm = new QueryModifier({
            top: 100,
            skip: 50,
            sortBy: "field1 field2",
            populate: false,
            filterBy: "{\"attr1\":23, \"attr2\":{\"attr2_1\":true,\"attr2_2\":\"Name\"}}"
        });
        
        expect(qm.top).toEqual(100);
        expect(qm.skip).toEqual(50);
        expect(qm.sortBy).toEqual("field1 field2");
        expect(qm.populate).toBe(false);
        expect(qm.filterBy).toEqual("{\"attr1\":23, \"attr2\":{\"attr2_1\":true,\"attr2_2\":\"Name\"}}");
    })
});

describe("QueryModifier Class - Calculated Parameters", () => {
    test(`No Paginating, No Sorting, No filtering, (all default parameters)`, () => {
        let qm = new QueryModifier({});

        expect(qm.isPaginated).toBe(false);
        expect(qm.isSorted).toBe(false);
        expect(qm.isFiltered).toBe(false);
    })
    test(`Paginating by setting only "top" attribute`, () => {
        let qm = new QueryModifier({
            top: 20
        });

        expect(qm.isPaginated).toBe(true);
        expect(qm.isSorted).toBe(false);
        expect(qm.isFiltered).toBe(false);
    })
    test(`Paginating by setting only "skip" attribute`, () => {
        let qm = new QueryModifier({
            skip: 20
        });

        expect(qm.isPaginated).toBe(true);
        expect(qm.isSorted).toBe(false);
        expect(qm.isFiltered).toBe(false);
    })
    test(`Paginating by setting both, "top" & "skip" attributes`, () => {
        let qm = new QueryModifier({
            top: 20,
            skip: 5
        });

        expect(qm.isPaginated).toBe(true);
        expect(qm.isSorted).toBe(false);
        expect(qm.isFiltered).toBe(false);
    })
    test(`Sorting attribute`, () => {
        let qm = new QueryModifier({
            sortBy: "this is the sorting!"
        });

        expect(qm.isPaginated).toBe(false);
        expect(qm.isSorted).toBe(true);
        expect(qm.isFiltered).toBe(false);
    })
    test(`Filtering attribute`, () => {
        let qm = new QueryModifier({
            filterBy: `{ "id": "test" }`
        });

        expect(qm.isPaginated).toBe(false);
        expect(qm.isSorted).toBe(false);
        expect(qm.isFiltered).toBe(true);
    })
});
