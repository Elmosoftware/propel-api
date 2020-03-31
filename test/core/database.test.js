const db = require("../../core/database");
const cfg = require("../../core/config")

jest.spyOn(db, "models", "get") //To emulate prod site
    .mockReturnValue([
        {
            repository: {
                name: "ModelOne"
            },
            schema: {
            },
            name: "ModelOne",
            pluralName: "ModelOnes"
        },
        {
            repository: {
                name: "ModelTwo"
            },
            schema: {
            },
            name: "ModelTwo",
            pluralName: "ModelTwos"
        }
    ]);

describe("Database Class - Invalid parameters", () => {

    test(`Database.getService({not an string})"`, () => {
        expect(() => {
            db.getService(123);
          }).toThrow(`"modelName" is not from the expected type`);
    }),
    test(`Database.getService({null})"`, () => {
        expect(() => {
            db.getService(null);
          }).toThrow(`"modelName" is not from the expected type`);
    })
    test(`Database.getService({undefined})"`, () => {
        expect(() => {
            db.getService(undefined);
          }).toThrow(`"modelName" is not from the expected type`);
    })
    test(`Database.getService({object})"`, () => {
        expect(() => {
            db.getService({});
          }).toThrow(`"modelName" is not from the expected type`);
    })
})
describe("Database Class - Valid parameters", () => {

    test(`Database.getService({valid model name})`, () => {

        let modelName = "ModelOne"
        let svc = db.getService(modelName);

        expect(svc.modelName).toBe(modelName);

    })
})
