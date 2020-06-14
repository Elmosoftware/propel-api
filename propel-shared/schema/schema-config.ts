/**
 * Holds some Entity model specific configuration.
 */
class SchemaConfig {

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

  /**
   * Prefix used for all the queries that get data by Id.
   */
  public readonly GraphQLQueryGetByIdQueryPrefix: string;

  /**
   * Prefix used for all the queries that find data using a query modifier.
   */
  public readonly GraphQLQueryFindQueryPrefix: string;
  
  /**
   * Prefix used for all the mutations that insert data.
   */
  public readonly GraphQLMutationInsertPrefix: string;
  
  /**
   * Prefix used for all the mutations that update data.
   */
  public readonly GraphQLMutationUpdatePrefix: string;
  
  /**
   * Prefix used for all the mutations that insert data.
   */
  public readonly GraphQLMutationDeletePrefix: string;

  /**
   * Allows type conversion from other types like Javascript, mongo db, etc, to his 
   * correspondent in GraphQL.
   */
  public readonly GraphQLTypeConversion: any;

  constructor() {
    this.GraphQLQueryInputSuffix = "Input"
    this.GraphQLQueryResultsSuffix = "QueryResults"
    this.GraphQLQueryOptionsName = "QueryModifier"

    this.GraphQLQueryGetByIdQueryPrefix = "get";
    this.GraphQLQueryFindQueryPrefix = "find";

    this.GraphQLMutationInsertPrefix = "insert"
    this.GraphQLMutationUpdatePrefix = "update"
    this.GraphQLMutationDeletePrefix = "delete"
  
    this.GraphQLTypeConversion = {
      String: "String",
      Number: "Int",
      Date: "String",
      Buffer: "[Int]!",
      Boolean: "Boolean",
      Mixed: "String",
      ObjectID: "ID",
      Id: "ID",
      Decimal128: "Float",
      Float: "Float"
    }
  }
}

export let schemaConfig = new SchemaConfig();