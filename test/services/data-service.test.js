const { DataService } = require("../../services/data-service");

function getModel(inheritFromEntityBase = false) {

    let schema = {}

    if (!inheritFromEntityBase) {
        schema.createdBy= { type: String, required: false };
    }

    return {
        repository:{
            create(doc) {
                return doc;
            }
        },
        schema: schema
    };
}

describe("DataService Class - add()", () => {

    test(`Setting audit data for "EntityBase" entities (with no audit data)`, () => {
        let m = getModel(true)
        let ds = new DataService(m)
        let doc= ds.add({
            _id: "id"
        })

        expect(doc._id).toEqual("id");
        expect(doc.createdOn).toBeFalsy();
        expect(doc.createdBy).toBeFalsy();
        expect(doc.lastUpdateOn).toBeFalsy();
        expect(doc.lastUpdateBy).toBeFalsy();
        expect(doc.deletedOn).toEqual(null);
    }),
    test(`Setting audit data for "Entity" entities (with audit data)`, () => {
        let m = getModel(false)
        let ds = new DataService(m)
        let doc= ds.add({
            _id: "id"
        })

        expect(doc._id).toEqual("id");
        expect(doc.createdOn).not.toBeFalsy();
        expect(doc.createdBy).toBeFalsy();
        expect(doc.lastUpdateOn).toBeFalsy();
        expect(doc.lastUpdateBy).toBeFalsy();
        expect(doc.deletedOn).toEqual(null);
    })
})

describe("DataService Class - update()", () => {
    test(`Must Throw if document is a Null reference"`, () => {

        let m = getModel(false)
        let ds = new DataService(m)

        expect(() => {
            ds.update(null);
        }).toThrow(`The method "update" expect a not null reference for the "document" param`);
    }),
    test(`Must Throw if document doesn't have an "_id" property"`, () => {

        let m = getModel(false)
        let ds = new DataService(m)

        expect(() => {
            ds.update({
                attr1: "Hello",
                attr2: "world"
            });
        }).toThrow(`The method "update" expect a document with an "_id" attribute`);
    }),
    test(`Must Throw if document doesn't have a valid ObjectId value in the "_id" property"`, () => {

        let m = getModel(false)
        let ds = new DataService(m)

        expect(() => {
            ds.update({
                _id: "invalid id"
            });
        }).toThrow(`The method "update" expect a valid ObjectId in the parameter "id"`);
    })
});