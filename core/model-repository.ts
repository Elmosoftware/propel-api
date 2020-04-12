// @ts-check
import { Utils } from "../util/utils";
import { APIError } from "./api-error";
import { EntityModel } from "./entity-model";
import { entityModelConfig } from "./entity-model-config";

export class ModelRepository {

    private _models: EntityModel[] = [];

    constructor(nativeModels: any[]) {
        this._generate(nativeModels);
    }

    /**
     * Collection of database models.
     */
    get models() {
        return this._models;
    }

    /**
     * Returns the amount of database models stored in the repository.
     */
    get count() {
        return (this._models && this._models.length) ? this._models.length : 0;
    }

    /**
     * GraphQL types cross all the models.
     */
    getAPISpecificGraphQLTypes () {
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
    getModelByName(modelName: string) {
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

        let ret:string = "";
        let types:string = this.getAPISpecificGraphQLTypes()
        let queries:string[] = [];
        let mutations:string[] = [];

        this._models.forEach((model) =>{
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

    private _generate(nativeModels:any) {

        if (nativeModels && Array.isArray(nativeModels)) {
            this._models = [];

            //Creating one EntityModel per each native database model.
            nativeModels.forEach((nativeModel) => {
                this._models.push(new EntityModel(nativeModel));
            })

            //Generating the model "populateSchema" property that will allow document auto population:
            this._models.forEach(model => {
                model.populateSchema = Utils.defaultIfEmptyObject(Object.assign({},
                    this._recursivePopulateSchemas(model)), "");
            });
        }
        else {
            throw new APIError(`Database models initialization failed. The parameter "models" is a 
            null reference or is not an Array`);
        }
    }

    private _recursivePopulateSchemas(parentModel: EntityModel, childModel?: EntityModel) {

        let m: EntityModel = (!childModel) ? parentModel : childModel;
        let populateSchema: any = {};

        m.fields.forEach((field) => {

            if (field.isReference) {
                //We add a fieldSchema for the reference property that need to be populated.
                if (populateSchema.path) {
                    populateSchema.path += ` ${field.name}`
                }
                else {
                    populateSchema.path = field.name
                }

                //We need to add all the populate references for childs too!
                let child = this.getModelByName(field.referenceName);
                let populate = Object.assign({}, this._recursivePopulateSchemas(m, child));

                //If the child has at least one references, we will add those to the parent:
                if (!Utils.isEmptyObject(populate)) {
                    populateSchema.populate = populate;
                }
            }
        });

        return populateSchema
    }
}
