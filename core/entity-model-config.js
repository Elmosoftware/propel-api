/**
 * Holds some Entity model specific configuration.
 */
class EntityModelConfig {

    constructor() {
       this._internal = Object.freeze({
           GraphQLQueryInputSuffix: "Input",
           GraphQLQueryResultsSuffix: "QueryResults",
           GraphQLQueryOptionsName: "QueryModifier"
       });
    }

    /**
     * This is the suffix that the inferred GraphQL schema will have for all the "input" types. 
     */
    get GraphQLQueryInputSuffix() {
       return this._internal.GraphQLQueryInputSuffix;
    }

    /**
     * This is the suffix to use in the name of the Entity results types.
     */
    get GraphQLQueryResultsSuffix() {
       return this._internal.GraphQLQueryResultsSuffix;
    }

    /**
     * Name of the type we will use to set the query options type.
     */
    get GraphQLQueryOptionsName() {
       return this._internal.GraphQLQueryOptionsName;
    }
}

module.exports = new EntityModelConfig();