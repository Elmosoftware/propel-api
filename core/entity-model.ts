// @ts-check
import { Utils } from "../util/utils";
import { EntityField } from "./entity-field";
import { entityModelConfig } from "./entity-model-config";

/**
 * Entity Model
 */
export class EntityModel {

    private _repository: any;
    private _name: string;
    private _pluralName: string;
    private _populateSchema: any;
    private _internalFields: string[];
    private _auditFields: string[];
    private _fields: EntityField[];
    private _description: string;

    constructor(nativeModel: any) {
        this._repository = nativeModel;
        this._name = nativeModel.modelName;
        this._pluralName = nativeModel.collection.collectionName;
        this._populateSchema = null;
        this._internalFields = [];
        this._auditFields = [];
        this._fields = [];
        this._description = (nativeModel.schema.DESCRIPTION) ? String(nativeModel.schema.DESCRIPTION) : "";
        this._generate(nativeModel);
    }

    /**
     * Entity fields
     */
    get fields() {
        return this._fields;
    }

    get repository() {
        return this._repository;
    }

    get name() {
        return this._name;
    }

    get description() {
        return this._description;
    }

    get pluralName() {
        return this._pluralName;
    }

    get populateSchema() {
        return this._populateSchema;
    }
    set populateSchema(value: any) {
        this._populateSchema = value;
    }

    get internalFields() {
        return this._internalFields;
    }

    get auditFields() {
        return this._auditFields;
    }

    /**
     * Returns a boolean value indicating if the field exists.
     * @param {string} fieldName Field name to search for.
     */
    hasInternalField(fieldName: string) {
        return this._internalFields.length > 0 && this._internalFields.some((field) => {
            return field.toLowerCase() == field.toLowerCase();
        })
    }

    /**
     * Returns the EntityField object for the specified field.
     * @param {string} fieldName Field name to search for.
     */
    getFieldDefinition(fieldName: string): EntityField | undefined {
        return this._fields.find((fieldDef) => {
            return fieldDef.name.toLowerCase() == fieldName.toLowerCase();
        })
    }

    /**
     * Returns a collection of all the GraphQL types inferred from the database model.
     * @param {string} modelName Model name. This is optional and used only for embedded documents.
     * @param {any} fields EntityField collection. Only used for embedded documents. 
     */
    getGraphQLTypes(modelName?: string, fields?: EntityField[]): string[] {

        let items: string[] = [];
        let type = "";
        let input = "";
        let isEmbeddedSchema = false;

        if (!modelName) {
            modelName = Utils.capitalize(this.name);
        }
        else {
            modelName = Utils.capitalize(modelName);
            isEmbeddedSchema = true;
        }

        if (!fields) {
            fields = this.fields;
        }

        type = `"""${this.description}"""\ntype ${modelName} {\n`;
        input = `input ${modelName}${entityModelConfig.GraphQLQueryInputSuffix} {\n`;

        fields.forEach((fd) => {
            //Internal fields don't have to be included in the model schema. Also, fields that starts with 
            //double underscore must be excluded because that is reserved for GraphQL introspection:
            if (!(fd.isInternal || fd.name.startsWith("__"))) {
                if (fd.isEmbedded) {
                    items = items.concat(this.getGraphQLTypes(`${modelName}${Utils.capitalize(fd.name)}`,
                        fd.embeddedSchema));
                }

                type += `"""${fd.description}"""\n\t${fd.getGraphQLFieldDefinition()}\n`;
                input += `\t${fd.getGraphQLFieldDefinition(true)}\n`
            }
        })

        type += `}`
        items.push(type);

        if (!isEmbeddedSchema) {
            items.push(this.getModelSpecificGraphQLTypes());
        }

        input += `}`
        items.push(input);

        return items;
    }

    /**
     * Get all the types not defined in the database model but required for the GraphQL schema.
     */
    getModelSpecificGraphQLTypes(): string {
        let modelName = Utils.capitalize(this.name);

        return `type ${modelName}${entityModelConfig.GraphQLQueryResultsSuffix} {
\tdata: [${modelName}!]!
\tcount: Int!
\ttotalCount: Int
}`;
    }

    /**
     * Returns all the queries inferred from the database model.
     */
    getGraphQLQueries(): string[] {
        let modelName = Utils.capitalize(this.name);
        let pluralModelName = Utils.capitalize(this.pluralName);

        return [
            `get${modelName}(_id: String!): ${modelName}${entityModelConfig.GraphQLQueryResultsSuffix}`,
            `find${pluralModelName}(q: ${entityModelConfig.GraphQLQueryOptionsName}): ${modelName}${entityModelConfig.GraphQLQueryResultsSuffix}`
        ];
    }

    /**
     * Returns all the required mutations inferred from the database model.
     */
    getGraphQLMutations(): string[] {
        let modelName = Utils.capitalize(this.name);

        return [
            `insert${modelName}(doc: ${modelName}${entityModelConfig.GraphQLQueryInputSuffix}): ID!`,
            `update${modelName}(doc: ${modelName}${entityModelConfig.GraphQLQueryInputSuffix}): ID!`,
            `delete${modelName}(_id: String!): ID!`
        ];
    }

    private _generate(nativeModel: any): void {

        for (var key in nativeModel.schema.tree) {
            let fieldSchema = nativeModel.schema.path(key);

            //Virtuals will be excluded:
            if (fieldSchema) {
                let f = new EntityField(fieldSchema, nativeModel.modelName);

                if (f.isInternal) {
                    this.internalFields.push(f.name);
                }

                if (f.isAudit) {
                    this.auditFields.push(f.name);
                }

                this._fields.push(f);
            }
        }

        //Sorting fields by names helps to easiest management of the schema:
        this._fields = this._fields.sort((a, b) => {
            let ret = 0

            if (a.name < b.name) {
                ret = -1;
            }
            else if (a.name > b.name) {
                ret = 1;
            }

            return ret;
        });
    }
}
