import { QueryResults } from "../../core/query-results";

describe("QueryResults Class - Valid and Missing Parameters", () => {
    test(`No parameters specified, (all defaults)`, () => {
        let qr = new QueryResults<any>(null);

        expect(qr.data).toEqual([]);
        expect(qr.count).toEqual(0);
        expect(qr.totalCount).toEqual(0);
    })
    test(`Only parameter "data" valid but empty`, () => {
        let qr = new QueryResults<any>(new Array());

        expect(qr.data).toEqual([]);
        expect(qr.count).toEqual(0);
        expect(qr.totalCount).toEqual(0);
    })
    test(`Only parameter "data" valid and not empty`, () => {

        let data = [{
            id: 1,
            name: "name1"
        },
        {
            id: 2,
            name: "name2"
        }
        ]
        let qr = new QueryResults<any>(data);

        expect(qr.data).toEqual(data);
        expect(qr.count).toEqual(2);
        expect(qr.totalCount).toEqual(2);
    })
    test(`Parameter "data" valid and not empty and "totalCount" valid`, () => {

        let data = [{
            id: 1,
            name: "name1"
        },
        {
            id: 2,
            name: "name2"
        }
        ]
        let qr = new QueryResults<any>(data, 25);

        expect(qr.data).toEqual(data);
        expect(qr.count).toEqual(2);
        expect(qr.totalCount).toEqual(25);
    })
});
