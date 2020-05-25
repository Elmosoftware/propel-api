// @ts-check
import { Utils } from "../../propel-shared/utils/utils";
import { PropelError } from "../../propel-shared/core/propel-error";
import { EntityModel } from "./entity-model";
import { entityModelConfig } from "./entity-model-config";
import { Resolver } from "../schema/resolver";
import { EntityField } from "./entity-field";

export class ModelRepository {

    private _models: EntityModel[] = [];

    constructor(nativeModels: any[]) {
        this._generate(nativeModels);
    }

    /**
     * Collection of database models.
     */
    get models(): EntityModel[] {
        return this._models;
    }

    /**
     * Returns the amount of database models stored in the repository.
     */
    get count(): number {
        return (this._models && this._models.length) ? this._models.length : 0;
    }

    /**
     * GraphQL types cross all the models.
     */
    getAPISpecificGraphQLTypes(): string {
        return `input ${entityModelConfig.GraphQLQueryOptionsName} {
    top: Int
    skip: Int
    sortBy: String
    populate: Boolean
    filterBy: String
}\n`
    }

    /**
     * Return the specified model by his name.
     * @param {string} modelName Name of the model to search for.
     */
    getModelByName(modelName: string): EntityModel {
        let ret = null

        if (modelName && typeof modelName == "string") {

            ret = this._models.find((model) => {
                return model.name.toLowerCase() == modelName.toLowerCase();
            })

            if (!ret) {
                throw new Error(`There is no model named "${modelName}".`)
            }
        }
        else {
            throw new Error(`Parameter "modelName" is not from the expected type. Expected type "string" received type "${typeof modelName}".`);
        }

        return ret;
    }

    /**
     * Returns a text version of the inferred GraphQL schema for the database model.
     */
    getGraphQLSchema(): string {

        let ret: string = "";
        let types: string = this.getAPISpecificGraphQLTypes()
        let queries: string[] = [];
        let mutations: string[] = [];

        this._models.forEach((model) => {
            model.getGraphQLTypes().forEach((type) => {
                types += `${type}\n`
            });
            queries = queries.concat(model.getGraphQLQueries());
            mutations = mutations.concat(model.getGraphQLMutations());
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
     * Returns the Resolver object for all the Queries and Mutations in the model.
     */
    getGraphQLResolver(): any {
        let ret: any = {};
        let resolver = new Resolver();

        this.models.forEach((model: EntityModel) => {

            let modelName = Utils.capitalize(model.name);
            let pluralModelName = Utils.capitalize(model.pluralName);

            ret[`insert${modelName}`] = (args: any) => { return resolver.insert(`${model.name}`, args); };
            ret[`update${modelName}`] = (args: any) => { return resolver.update(`${model.name}`, args); };
            ret[`get${modelName}`] = (args: any) => { return resolver.getOne(`${model.name}`, args); };
            ret[`find${pluralModelName}`] = (args: any) => {
                return resolver.getMany(`${model.name}`, args);
            };
            ret[`delete${modelName}`] = (args: any) => { return resolver.delete(`${model.name}`, args); };
        })

        return ret;
    }

    private _generate(nativeModels: any): void {

        if (nativeModels && Array.isArray(nativeModels)) {
            this._models = [];

            //Creating one EntityModel per each native database model.
            nativeModels.forEach((nativeModel) => {
                this._models.push(new EntityModel(nativeModel));
            })

            //Generating the model "populateSchema" property that will allow document auto population:
            this._models.forEach(model => {
                model.populateSchema = this._buildPopulateSchema(model.fields);
            });
        }
        else {
            throw new PropelError(`Database models initialization failed. The parameter "models" is a 
            null reference or is not an Array`);
        }
    }

    private _buildPopulateSchema(fields: EntityField[], parentField?: EntityField): any[] {

        let populateSchema: any[] = [];
        let populate: any[];
        let childFields: EntityField[];

        fields.forEach((field) => {

            if (field.isReference || field.isEmbedded) {

                if (field.isReference) {
                    //If the field is a reference it need to be populated always. 
                    //The only consideration is: If the parent is an embedded object, this entry will 
                    //be added later as soon we get his below childs references, (if any).
                    if (!parentField || (parentField && !parentField.isEmbedded)) {
                        populateSchema.push({
                            path: field.name
                        });
                    }

                    childFields = this.getModelByName(field.referenceName).fields;
                }
                else {
                    childFields = field.embeddedSchema;
                }

                //We look recursively into child and subchild fields, looking for any other 
                //references that need to be populated too:
                populate = this._buildPopulateSchema(childFields, field);

                //If there is any child references:
                if (populate.length > 0) {
                    //In the case of embedded fields there is no point to add the populate path 
                    //at least they have some reference subfields that need to be populated too. That's
                    //why we add this entry at this point after checking if there is any child references:
                    if (parentField && parentField.isEmbedded) {
                        populateSchema.push({
                            //In the case of embeded fields sub references, we need to add the 
                            //parent embedded field name to the path also:
                            path: `${parentField.name}.${field.name}`
                        });
                    }

                   //Embedded field references need to be added individually:
                    if (field.isEmbedded) {
                        populateSchema = populateSchema.concat(populate);
                    }
                    else {
                        //If is a reference of another reference we need to ad it as a child:
                        populateSchema[populateSchema.length - 1].populate = populate;
                    }
                }
            }
        });

        return populateSchema
    }
}
