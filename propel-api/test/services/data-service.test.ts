import { DataService } from "../../services/data-service";

function getModel(inheritFromEntityBase = false) {

    let schema: any = {}

    if (!inheritFromEntityBase) {
        schema.createdBy= { type: String, required: false };
    }

    return {
        repository:{
            hydrate(doc: any) {
                return {
                    isNew: false,
                    save(){
                        return doc._id;
                    }
                };
            }
        },
        schema: schema
    };
}

describe("DataService Class - update()", () => {
    test(`Must Throw if document is a Null reference"`, () => {

        let m = getModel(false)
        //@ts-ignore
        let ds = new DataService(m)

        expect(() => {
            ds.update(null);
        }).toThrow(`The method "update" expect a not null reference for the "document" param`);
    }),
    test(`Must Throw if document doesn't have an "_id" property"`, () => {

        let m = getModel(false)
        //@ts-ignore
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
        //@ts-ignore
        let ds = new DataService(m)

        expect(() => {
            ds.update({
                _id: "invalid id"
            });
        }).toThrow(`The method "update" expect a valid ObjectId in the parameter "id"`);
    })
});