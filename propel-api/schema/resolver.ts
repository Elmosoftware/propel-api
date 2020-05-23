import { db } from "../core/database";
import { QueryModifier } from "../core/query-modifier";

/**
 * This call expose standard resolver methods for all the inferred entities in the GraphQL schema.
 */
export class Resolver {
    
    constructor(){
    }

    /**
     * Persists the document as a new one in the repository.
     * @param modelName target model name.
     * @param args Arguments must include the document to persist in the attribute "doc".
     */
    insert(modelName: string, args: any): Promise<any> {
        return db.getService(modelName).add(args.doc);
    }

    /**
     * Updates the do
     * @param modelName target model name.
     * @param args Arguments must include the document to persist in the attribute "doc". The supplied 
     * document must have set the "_id" attribute and can include allthedocumnt properties, or only the 
     * ones to be updated.
     */
    update(modelName: string, args: any): Promise<any> {
        return db.getService(modelName).update(args.doc);
    }

    /**
     * 
     * @param modelName target model name.
     * @param args Argument must include an "_id" property with the unique identifier of 
     * the document to retrieve.
     */
    getOne(modelName: string, args: any): Promise<any> {
        let qm = new QueryModifier({ filterBy: `{ "_id": "${args._id}" }` });
        return db.getService(modelName).find(qm);
    }

    /**
     * 
     * @param modelName target model name.
     * @param args Argument must include a "QueryModifier" object with the query details.
     */
    getMany(modelName: string, args: any): Promise<any> {
        return db.getService(modelName).find(args.q);
    }

    /**
     * 
     * @param modelName target model name.
     * @param args Argument must include an "_id" property with the unique identifier of 
     * the document to delete.
     */
    delete(modelName: string, args: any): Promise<any> {
        return db.getService(modelName).delete(args._id);
    }
}
