/**
 * Holds some Entity model specific configuration.
 */
class EntityModelConfig {

  /**
    * This is the suffix that the inferred GraphQL schema will have for all the "input" types. 
    */
  public readonly GraphQLQueryInputSuffix: string;

  /**
    * This is the suffix to use in the name of the Entity results types.
    */
  public readonly GraphQLQueryResultsSuffix: string;

  /**
    * Name of the type we will use to set the query options type.
    */
  public readonly GraphQLQueryOptionsName: string;

  constructor() {
    this.GraphQLQueryInputSuffix = "Input"
    this.GraphQLQueryResultsSuffix = "QueryResults"
    this.GraphQLQueryOptionsName = "QueryModifier"
  }
}

export let entityModelConfig = new EntityModelConfig();