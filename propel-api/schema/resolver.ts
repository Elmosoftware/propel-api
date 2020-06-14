import { db } from "../core/database";
import { QueryModifier } from "../../propel-shared/core/query-modifier";
import { GenericResolver } from "../../propel-shared/schema/generic-resolver";

/**
 * This call expose standard resolver methods for all the inferred entities in the GraphQL schema.
 */
export class Resolver implements GenericResolver {
    
    constructor(){
    }

    insert(modelName: string, args: any): Promise<any> {
        return db.getService(modelName).add(args.doc);
    }

    update(modelName: string, args: any): Promise<any> {
        return db.getService(modelName).update(args.doc);
    }

    getOne(modelName: string, args: any): Promise<any> {
        let qm = new QueryModifier({ filterBy: `{ "_id": "${args.id}" }` });
        return db.getService(modelName).find(qm);
    }

    getMany(modelName: string, args: any): Promise<any> {
        return db.getService(modelName).find(args.q);
    }

    delete(modelName: string, args: any): Promise<any> {
        return db.getService(modelName).delete(args.id);
    }
}
