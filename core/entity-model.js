// @ts-check

const Utils = require("../util/utils");
const EntityField = require("./entity-field");
const emc = require("./entity-model-config");

/**
 * Entity Model
 */
class EntityModel {

    constructor(nativeModel) {
        this.repository = nativeModel;
        // this.schema = nativeModel.schema.tree;
        this.name = nativeModel.modelName;
        this.pluralName = nativeModel.collection.collectionName;
        this.populateSchema = null;
        this.internalFields = [];
        this.auditFields = [];
        this._fields = [];
        this.description = (nativeModel.schema.DESCRIPTION) ? String(nativeModel.schema.DESCRIPTION) : "";
        this._generate(nativeModel);
    }

    /**
     * Entity fields
     */
    get fields() {
        return this._fields;
    }

    /**
     * Returns a boolean value indicating if the field exists.
     * @param {string} fieldName Field name to search for.
     */
    hasInternalField(fieldName) {
        return this.internalFields.length > 0 && this.internalFields.some((field) => {
            return field.toLowerCase() == field.toLowerCase();
        })
    }

    /**
     * Returns the EntityField object for the specified field.
     * @param {string} fieldName Field name to search for.
     */
    getFieldDefinition(fieldName) {
        return this.fields.find((fieldDef) => {
            return fieldDef.name.toLowerCase() == fieldName.toLowerCase();
        })
    }

    /**
     * Returns a collection of all the GraphQL types inferred from the database model.
     * @param {string} modelName Model name. This is optional and used only for embedded documents.
     * @param {any} fields EntityField collection. Only us for embedded documents. 
     */
    getGraphQLTypes(modelName = null, fields = null) {

        let items = [];
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
        input = `input ${modelName}${emc.GraphQLQueryInputSuffix} {\n`;

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
    getModelSpecificGraphQLTypes() {
        let modelName = Utils.capitalize(this.name);

        return `type ${modelName}${emc.GraphQLQueryResultsSuffix} {
\tdata: [${modelName}!]!
\tcount: Int!
\ttotalCount: Int
}`;
    }

    /**
     * Returns all the queries inferred from the database model.
     */
    getGraphQLQueries() {
        let modelName = Utils.capitalize(this.name);
        let pluralModelName = Utils.capitalize(this.pluralName);

        return [
            `get${modelName}(_id: String!): ${modelName}${emc.GraphQLQueryResultsSuffix}`,
            `find${pluralModelName}(q: ${emc.GraphQLQueryOptionsName}): ${modelName}${emc.GraphQLQueryResultsSuffix}`
        ];
    }

    /**
     * Returns all the required mutations inferred from the database model.
     */
    getGraphQLMutations() {
        let modelName = Utils.capitalize(this.name);

        return [
            `insert${modelName}(doc: ${modelName}${emc.GraphQLQueryInputSuffix}): ID!`,
            `update${modelName}(doc: ${modelName}${emc.GraphQLQueryInputSuffix}): ID!`,
            `delete${modelName}(_id: String!): ID!`
        ];
    }

    _generate(nativeModel) {

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

        this._fields = Object.freeze(this._fields);
    }
}

module.exports = EntityModel;