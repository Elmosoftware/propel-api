import { db } from "../../core/database";
import { DataRouter } from "../../routes/data";
import { DataService } from "../../services/data-service";
import { APIResponse } from "../../../propel-shared/core/api-response";

let d: DataRouter;
let svc: DataService
let action: string;

describe("DataRouter class - processFind()", () => {

    beforeEach(() => {
        action = "find"
        d = new DataRouter();
        svc = db.getService("Group") //Any model name will be fine, we wiil mock the methods inside.
        svc.find = (qm: any) => { //To avoid hitting the DB.
            return Promise.resolve(new APIResponse<any>(null, "FIND"));
        }
    })

    test(`Body with only action attribute`, (done) => {
        let body = { action: action }
        
        //@ts-ignore
        d.processFind(body, svc)
            .then((value: APIResponse<any>) => {
                expect(value.data[0]).toEqual("FIND");
                done();
            })
            .catch((err: any) => {
                expect(err).toBe("Don't expect an exception on this call!!!")
                done()
            })
    })
    test(`Body with non string entity must throw`, (done) => {
        let body = { action: action, entity: new Date() }

        //@ts-ignore
        d.processFind(body, svc)
            .then((value: any) => {
                expect(value).toEqual("Don't expect to return a value here!!!");
                done();
            })
            .catch((err: APIResponse<any>) => {
                expect(err.errors[0].message).toContain("Find action was aborted because the body entity attribute is not a string")
                done()
            })
    })
    test(`Body with string entity but not a valid ID must throw`, (done) => {
        let body = { action: action, entity: "xxx" }
        //@ts-ignore
        d.processFind(body, svc)
            .then((value: any) => {
                expect(value).toEqual("Don't expect to return a value here!!!");
                done();
            })
            .catch((err: APIResponse<any>) => {
                expect(err.errors[0].message).toContain("The id specified is not a valid identifier")
                done()
            })
    })
})

describe("DataRouter class - processSave()", () => {

    beforeEach(() => {
        action = "save"
        d = new DataRouter();
        svc = db.getService("Group") //Any model name will be fine, we wiil mock the methods inside.
        svc.update = (document: any) => { //To avoid hitting the DB.
            return Promise.resolve(new APIResponse<any>(null, "UPDATE"));
        }
        svc.add = (document: any) => { //To avoid hitting the DB.
            return Promise.resolve(new APIResponse<any>(null, "ADD"));
        }
    })

    test(`Body with object entity and without "_id" attribute, forcing to call service.add().`, (done) => {
        let body = { action: action, entity: { newObject: 1 }}
        
        //@ts-ignore
        d.processSave(body, svc)
            .then((value: APIResponse<any>) => {
                expect(value.data[0]).toEqual("ADD");
                done();
            })
            .catch((err: any) => {
                expect(err).toBe("Don't expect an exception on this call!!!")
                done()
            })
    })
    test(`Body with object entity with "_id" attribute, forcing to call service.update().`, (done) => {
        let body = { action: action, entity: { _id: "xxxx", newObject: 1 }}
        
        //@ts-ignore
        d.processSave(body, svc)
            .then((value: APIResponse<any>) => {
                expect(value.data[0]).toEqual("UPDATE");
                done();
            })
            .catch((err: any) => {
                expect(err).toBe("Don't expect an exception on this call!!!")
                done()
            })
    })
    
    test(`Body with non-object entity must throw`, (done) => {
        let body = { action: action, entity: "xxx" }
        //@ts-ignore
        d.processSave(body, svc)
            .then((value: any) => {
                expect(value).toEqual("Don't expect to return a value here!!!");
                done();
            })
            .catch((err: APIResponse<any>) => {
                expect(err.errors[0].message).toContain("Save action was aborted because the body doesn't contain an entity object")
                done();
            })
    })
})
describe("DataRouter class - processDelete()", () => {

    beforeEach(() => {
        action = "delete"
        d = new DataRouter();
        svc = db.getService("Group") //Any model name will be fine, we wiil mock the methods inside.
        svc.delete = (id: string) => { //To avoid hitting the DB.
            return Promise.resolve(new APIResponse<any>(null, "DELETE"));
        }
    })

    test(`Body with string entity`, (done) => {
        let body = { action: action, entity: "xxx"}
        
        //@ts-ignore
        d.processDelete(body, svc)
            .then((value: APIResponse<any>) => {
                expect(value.data[0]).toEqual("DELETE");
                done();
            })
            .catch((err: any) => {
                expect(err).toBe("Don't expect an exception on this call!!!")
                done()
            })
    })
    test(`Body with object entity with "_id" attribute`, (done) => {
        let body = { action: action, entity: { _id: "xxx" }}
        
        //@ts-ignore
        d.processDelete(body, svc)
            .then((value: APIResponse<any>) => {
                expect(value.data[0]).toEqual("DELETE");
                done();
            })
            .catch((err: any) => {
                expect(err).toBe("Don't expect an exception on this call!!!")
                done()
            })
    })
    test(`Body without entity attribute must throw.`, (done) => {
        let body = { action: action };
        
        //@ts-ignore
        d.processDelete(body, svc)
            .then((value: any) => {
                expect(value).toEqual("Don't expect to return a value here!!!");
                done();
            })
            .catch((err: APIResponse<any>) => {
                expect(err.errors[0].message).toContain("Delete action was aborted because the body doesn't contain an entity object")
                done();
            })
    })
})