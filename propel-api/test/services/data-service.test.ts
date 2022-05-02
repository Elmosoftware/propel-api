import { DataService } from "../../services/data-service";
import { APIResponse } from "../../../propel-shared/core/api-response";

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
    test(`Must Throw if document is a Null reference"`, (done) => {

        let m = getModel(false)
        //@ts-ignore
        let ds = new DataService(m)

        ds.update(null)
            .then((data: any) => {
                expect(data).toBe(null); //We dont expect a call here.
                done();
            })
            .catch((e: APIResponse<any>) => {
                expect(e.error.message).toContain(`The method "update" expect a not null reference for the "document" param`);
                done()
            })
    }),
    test(`Must Throw if document doesn't have an "_id" property"`, (done) => {

        let m = getModel(false)
        //@ts-ignore
        let ds = new DataService(m)

        ds.update({
            attr1: "Hello",
            attr2: "world"
        })
            .then((data: any) => {
                expect(data).toBe(null); //We dont expect a call here.
                done();
            })
            .catch((e: APIResponse<any>) => {
                expect(e.error.message).toContain(`The method "update" expect a document with an "_id" attribute`);
                done()
            })
    }),
    test(`Must Throw if document doesn't have a valid ObjectId value in the "_id" property"`, (done) => {

        let m = getModel(false)
        //@ts-ignore
        let ds = new DataService(m)

        ds.update({
            _id: "invalid id"
        })
            .then((data: any) => {
                expect(data).toBe(null); //We dont expect a call here.
                done();
            })
            .catch((e: APIResponse<any>) => {
                expect(e.error.message).toContain(`The method "update" expect a valid ObjectId in the parameter "id"`);
                done()
            })
    })
});