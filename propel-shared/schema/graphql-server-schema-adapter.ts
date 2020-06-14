import { SchemaRepository } from "./schema-repository";
import { schemaConfig } from "./schema-config";
import { SchemaDefinition } from "./schema-definition";
import { SchemaField } from "./schema-field";
import { PropelError } from "../core/propel-error";
import { GenericResolver } from "./generic-resolver";

/**
 * Schema definition adapter to generate required GraphQL server side artifacts like Queries, Mutations, Resolvers, etc.
 */
export class GraphQLServerSchemaAdapter {

    private _repo: SchemaRepository;

    constructor(repo: SchemaRepository){
        this._repo = repo;
    }

    /**
     * GraphQL types cross all the models.
     */
    getAPISpecificGraphQLTypes(): string {
        return `input ${schemaConfig.GraphQLQueryOptionsName} {
    top: Int
    skip: Int
    sortBy: String
    populate: Boolean
    filterBy: String
}\n`
    }

    /**
     * Returns a text version of the inferred GraphQL schema.
     */
    getSchema(): string {
        let ret: string = "";
        let types: string = this.getAPISpecificGraphQLTypes()
        let queries: string[] = [];
        let mutations: string[] = [];

        this._repo.entitySchemas.forEach((schema) => {
            this.getTypesAndInputs(schema).forEach((type) => {
                types += `${type}\n`
            });
            queries = queries.concat(this.getQueries(schema));
            mutations = mutations.concat(this.getMutations(schema));
        })

        ret = types;

        ret += `type Queries {\n`
        queries.forEach((query) => {
            ret += `\t${query}\n`;
        })
        ret += `}\n`

        ret += `type Mutations {\n`
        mutations.forEach((mutation) => {
            ret += `\t${mutation}\n`;
        })
        ret += `}\n`

        ret += `schema {
\tquery: Queries
\tmutation: Mutations
}`
        return ret;
    }

    /**
     * Returns the Resolver object for all the Queries and Mutations in the schema.
     * @param resolverInstance Instance of a GenericResolver to be used to resolve all the queries and mutations.
     */
    getResolver(resolverInstance: GenericResolver): any {
        let ret: any = {};

        this._repo.entitySchemas.forEach((schema: Readonly<SchemaDefinition>) => {
            ret[`insert${schema.name}`] = (args: any) => {
                return resolverInstance.insert(`${schema.name}`, args);
            };
            ret[`update${schema.name}`] = (args: any) => {
                return resolverInstance.update(`${schema.name}`, args);
            };
            ret[`get${schema.name}`] = (args: any) => {
                return resolverInstance.getOne(`${schema.name}`, args);
            };
            ret[`find${schema.pluralName}`] = (args: any) => {
                return resolverInstance.getMany(`${schema.name}`, args);
            };
            ret[`delete${schema.name}`] = (args: any) => {
                return resolverInstance.delete(`${schema.name}`, args);
            };
        })

        return ret;
    }

    /**
     * Returns the GraphQL schema for all the types and inputs can be inferred from the supplied schema.
     * @param schema Schema
     */
    getTypesAndInputs(schema: Readonly<SchemaDefinition>): string[] {
        let types: string[]
        types = this._getTypesAndInputsRecursive(schema.name, schema.description, schema.getFields());

        if (schema.isEntity) {
            types.push(this.getAuxiliaryTypes(schema));
        }

        return types;
    }

    /**
     * Returns all auxiliary types not defined in the schemas.
     */
    getAuxiliaryTypes(schema: Readonly<SchemaDefinition>): string {
        return `type ${schema.name}${schemaConfig.GraphQLQueryResultsSuffix} {
\tdata: [${schema.name}!]!
\tcount: Int!
\ttotalCount: Int
}`;
    }

    /**
     * Returns all the queries inferred from the schema.
     */
    getQueries(schema: Readonly<SchemaDefinition>): string[] {
        return [
            `${schemaConfig.GraphQLQueryGetByIdQueryPrefix}${schema.name}(id: String!): ${schema.name}${schemaConfig.GraphQLQueryResultsSuffix}`,
            `${schemaConfig.GraphQLQueryFindQueryPrefix}${schema.pluralName}(q: ${schemaConfig.GraphQLQueryOptionsName}): ${schema.name}${schemaConfig.GraphQLQueryResultsSuffix}`
        ];
    }

    /**
     * Returns all the mutations inferred from the schema.
     */
    getMutations(schema: Readonly<SchemaDefinition>): string[] {
        return [
            `${schemaConfig.GraphQLMutationInsertPrefix}${schema.name}(doc: ${schema.name}${schemaConfig.GraphQLQueryInputSuffix}): ID!`,
            `${schemaConfig.GraphQLMutationUpdatePrefix}${schema.name}(doc: ${schema.name}${schemaConfig.GraphQLQueryInputSuffix}): ID!`,
            `${schemaConfig.GraphQLMutationDeletePrefix}${schema.name}(id: String!): ID!`
        ];
    }
    
    /**
     * Get the field definition as must be included as part of a type or input definition.
     * @param {boolean} asGraphQLInput Indicates if the field definition will be used for a GraphQL input.
     */
    getFieldDefinition(field: SchemaField, asGraphQLInput: boolean = false): string {

        let graphQLType: string = this.getFieldType(field);
        let suffix: string = "";
        let req: boolean = false;

        if (!field.schema) throw new PropelError(
            `The field "${field.name}" has not schema set yet!. You can't infer GraphQL field definition.`)

        // If the field definition will be used in a GraphQL "input" instead of a "type":
        if (asGraphQLInput) {
            //If the field is a reference to another schema:
            if (field.typeIsSchema) {
                //If is an entity, in the GraphQL input we must change the type to "ID":
                if (field.type.isEntity) {
                    graphQLType = schemaConfig.GraphQLTypeConversion.Id
                }
                else {
                    //In a GraphQL input we can't have types, only scalars and other inputs. So, if 
                    //the field is an embedded entity, we need to use his "input", instead 
                    //of his "type":
                    suffix = schemaConfig.GraphQLQueryInputSuffix;
                }
            }
        }

        //If the definition is for a GraphQL input, IDs are not required, (because they need to 
        //be absent when we are inserting a new entity):
        req = (asGraphQLInput && field.isId) ? false : field.isRequired;

        return `${field.name}: ${(field.isArray) ? "[" : ""}${graphQLType}${suffix}${(req) ? "!" : ""}${(field.isArray) ? "]!" : ""}`;
    }

    /**
     * Returns the equivalent GraphQL type for the specified field.
     */
    getFieldType(field: SchemaField): string {

        if (field.IsScalar) {
            if (field.isId) return "ID";
            if (schemaConfig.GraphQLTypeConversion[field.type.name]) return schemaConfig.GraphQLTypeConversion[field.type.name];
            throw new PropelError(`The specified type is not supported by this API. Therefore can't be converted to a GraphQL
 Type specified: "${field.type.name}".`)
        }
        else if (field.isReference) {
            return field.type.name;
        }
        else { //If is an embedded schema:
            return field.fieldName;
        }
    }

    /**
     * Returns a collection of all the GraphQL types and inputs inferred from this schema.
     * @param {string} schemaName Schema name. This is optional and used only for embedded schemas.
     * @param {any} fields Fields collection. Only used for embedded schemas. 
     */
    private _getTypesAndInputsRecursive(schemaName: string, schemaDesc: string, fields: SchemaField[]): string[] {

        let items: string[] = [];
        let type = "";
        let input = "";

        type = `"""${schemaDesc}"""\ntype ${schemaName} {\n`;
        input = `input ${schemaName}${schemaConfig.GraphQLQueryInputSuffix} {\n`;

        fields.forEach((fd) => {
            //A few considerations here:
            // - Internal fields: They are for internal use only, so need to be excluded from the 
            //  GraphQL schema.
            // - Audit fields: - Need to be excluded from GraphQL inputs, (because they are updated by the
            //  API only), but need to be included in the GraphQL types, because they can be queried.
            if (!fd.isInternal) {
                if (fd.isEmbedded) {
                    //When the field is an embedded subdocument, the type and input name will 
                    //be composed by the schema name and the field name too, because embedded 
                    //schemas are not entity schemas:
                    items = items.concat(this._getTypesAndInputsRecursive(fd.fieldName, fd.description, fd.type.getFields()));
                }
                
                type += `"""${fd.description}"""\n\t${this.getFieldDefinition(fd, false)}\n`;
                
                if (!fd.isAudit) {
                    input += `\t${this.getFieldDefinition(fd, true)}\n`
                }
            }
        })

        type += `}`
        items.push(type);
        input += `}`
        items.push(input);

        return items;
    }

}
