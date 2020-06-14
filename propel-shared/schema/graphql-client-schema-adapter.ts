import { SchemaRepository } from "./schema-repository";
import { schemaConfig } from "./schema-config";
import { Utils } from "../utils/utils";
import { Entity } from "../models/entity";
import { QueryModifier } from "../core/query-modifier";
import { SchemaDefinition } from "./schema-definition";
import { SchemaField } from "./schema-field";

/**
 * Schema definition adapter to generate required GraphQL cient side artifacts like Queries and Mutations.
 */
export class GraphQLClientSchemaAdapter {

    private _repo: SchemaRepository;

    constructor(repo: SchemaRepository){
        this._repo = repo;
    }

    /**
     * Build the query required to fetch one entity of type "EntityType" that have the value supplied 
     * in the "id" parameter as unique identifier. 
     * @param entityType Type of the entity to work on.
     * @param id Unique identifier to fetch.
     * @param excludeFields List of fields to exclude from the query.
     */
    buildGetByIdQuery<T extends Entity>(entityType: { new(): T }, id: string, excludeFields: string[]): Query {

        let ret = new Query();
        let schema = this._repo.getEntitySchemaByName(entityType.name);

        ret.query = Utils.gqlPrettifier(`query($id: String!){get${schema.name}(id: $id){${this.getFieldListForQuery(schema, excludeFields)}}`)
        ret.variables = {
            id: id
        }

        return ret;
    }

    /**
     * Build the query required to fetch one or more entities of type "EntityType" by applying the 
     * supplied QueryModifier.. 
     * @param entityType Type of the entity to work on.
     * @param qm QueryModifier instance.
     * @param excludeFields List of fields to exclude from the query.
     */
    buildFindQuery<T extends Entity>(entityType: { new(): T }, qm: QueryModifier, excludeFields: string[]): Query {

        let ret = new Query();
        let schema = this._repo.getEntitySchemaByName(entityType.name);

        ret.query = Utils.gqlPrettifier(`query($q: QueryModifier){find${schema.pluralName}(q: $q){${this.getFieldListForQuery(schema, excludeFields)}}`)
        ret.variables = {
            q: qm
        }

        return ret;
    }

    /**
     * Builds the insert mutation for the specified entity.
     * @param entityType Type of the entity to work on.
     * @param entity Entity instance to insert.
     */
    buildInsertMutation<T extends Entity>(entityType: { new(): T }, entity: T): Query {
        return this._buildMutation(schemaConfig.GraphQLMutationInsertPrefix, entityType, entity);
    }

    /**
     * Builds the update mutation for the specified entity.
     * @param entityType Type of the entity to work on.
     * @param entity Entity instance to update.
     */
    buildUpdateMutation<T extends Entity>(entityType: { new(): T }, entity: T): Query {
        return this._buildMutation(schemaConfig.GraphQLMutationUpdatePrefix, entityType, entity);
    }

    /**
     * Builds the delete mutation for the specified entity.
     * @param entityType Type of the entity to work on.
     * @param entity Entity instance to delete.
     */
    buildDeleteMutation<T extends Entity>(entityType: { new(): T }, entity: T): Query {
        return this._buildMutation(schemaConfig.GraphQLMutationDeletePrefix, entityType, entity);
    }

    /**
     * Get a serialized query results with the fields in the specified schema. Optionally you can specify 
     * an exclusion list.
     * @param Schema Schema definition.
     * @param excludeFields List of fields to be excluded. You can use a "." to indicate fields in 
     * subclasses like "user.address.street" or even "user.address" in order to remove the Address 
     * subclass entirely.  
     */
    getFieldListForQuery(schema: Readonly<SchemaDefinition>, excludeFields?: string[]): string {
        if (!excludeFields) {
            excludeFields = []
        }

        return `data{${this._getFieldListForQueryRecursive(schema, excludeFields)}}count\ntotalCount}`
    }

    private _buildMutation<T extends Entity>(mutationPrefix: string, entityType: { new(): T }, entity: T): Query {

        let ret = new Query();
        let schema = this._repo.getEntitySchemaByName(entityType.name);
        let argName: string = "doc";
        let argType: string = `${schema.name}${schemaConfig.GraphQLQueryInputSuffix}`;
        let isDel: boolean = false;
        
        if (mutationPrefix == schemaConfig.GraphQLMutationDeletePrefix) {
            isDel = true;
            argName = "id";
            argType = "String!"
        }

        ret.query = Utils.gqlPrettifier(
            `mutation($${argName}:${argType}){${mutationPrefix}${schema.name}(${argName}: $${argName})}`)

        ret.variables = {
            [argName]: (isDel) ? entity._id : entity
        }

        return ret;
    }

    private _getFieldListForQueryRecursive(schema: Readonly<SchemaDefinition>, excludeFields: string[], 
        parentField: string = ""): string {
        
        let ret: string = "";
        let cr: string = `\n`;
        parentField = (parentField) ? `${parentField}.` : "";

        schema.getFields(false, true).forEach((field: SchemaField) => {
            let fullName = `${parentField}${field.name}`
            if (!excludeFields.includes(fullName)) {
                ret += `${(ret) ? cr : ""}${field.name}`
                if (field.typeIsSchema) {
                    ret += ` {${this._getFieldListForQueryRecursive(field.type, excludeFields, fullName)}}`
                }
            }
        });

        return ret;
    }
}

/**
 * GraphQL query.
 */
export class Query {

    public query: string = "";

    public variables: any = {};

    constructor(query: string = "", variables: any = {}) {
        this.query = query;
        this.variables = variables;
    }
}
