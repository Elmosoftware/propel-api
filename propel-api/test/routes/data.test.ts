import { db } from "../../core/database";
import { DataRoute } from "../../routes/data";
import { DataService } from "../../services/data-service";
import { PagedResponse } from "../../../propel-shared/core/paged-response";

let d: DataRoute;
let svc: DataService
let action: string;

describe("DataRouter class - processFind()", () => {

    beforeEach(() => {
        action = "find"
        d = new DataRoute();
        svc = db.getService("Script") //Any model name will be fine, we wiil mock the methods inside.
        svc.find = (qm: any) => { //To avoid hitting the DB.
            return Promise.resolve(new PagedResponse<any>("FIND"));
        }
    })

    test(`Body with only action attribute`, (done) => {
        let body = { action: action }
        
        //@ts-ignore
        d.processFind(body, svc)
            .then((value: PagedResponse<any>) => {
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
            .catch((err) => {
                expect(err.message).toContain("Find action was aborted because the body entity attribute is not a string")
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
            .catch((err) => {
                expect(err.message).toContain("The id specified is not a valid identifier")
                done()
            })
    })
})

describe("DataRouter class - processSave()", () => {

    beforeEach(() => {
        action = "save"
        d = new DataRoute();
        svc = db.getService("Script") //Any model name will be fine, we wiil mock the methods inside.
        svc.update = (document: any) => { //To avoid hitting the DB.
            return Promise.resolve("UPDATE");
        }
        svc.add = (document: any) => { //To avoid hitting the DB.
            return Promise.resolve("ADD");
        }
    })

    test(`Body with object entity and without "_id" attribute, forcing to call service.add().`, (done) => {
        let body = { action: action, entity: { newObject: 1 }}
        
        //@ts-ignore
        d.processSave(body, svc)
            .then((value: string) => {
                expect(value).toEqual("ADD");
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
            .then((value: string) => {
                expect(value).toEqual("UPDATE");
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
            .then((value: string) => {
                expect(value).toEqual("Don't expect to return a value here!!!");
                done();
            })
            .catch((err) => {
                expect(err.message).toContain("Save action was aborted because the body doesn't contain an entity object")
                done();
            })
    })
})
describe("DataRouter class - processDelete()", () => {

    beforeEach(() => {
        action = "delete"
        d = new DataRoute();
        svc = db.getService("Script") //Any model name will be fine, we wiil mock the methods inside.
        svc.delete = (id: string) => { //To avoid hitting the DB.
            return Promise.resolve("DELETE");
        }
    })

    test(`Body with string entity`, (done) => {
        let body = { action: action, entity: "xxx"}
        
        //@ts-ignore
        d.processDelete(body, svc)
            .then((value: string) => {
                expect(value).toEqual("DELETE");
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
            .then((value: string) => {
                expect(value).toEqual("DELETE");
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
            .catch((err) => {
                expect(err.message).toContain("Delete action was aborted because the body doesn't contain an entity object")
                done();
            })
    })
})