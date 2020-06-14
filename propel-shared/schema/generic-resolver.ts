/**
 * Generic Resolver that includes the required methods to handle GraphQL inferred mutations.
 */
export interface GenericResolver {

    /**
     * Persists the document as a new one in the repository.
     * @param modelName target model name.
     * @param args Arguments must include the document to persist in the attribute "doc".
     */
    insert(modelName: string, args: any): Promise<any>
    
    /**
     * Updates the document.
     * @param modelName target model name.
     * @param args Arguments must include the document to persist in the attribute "doc". The supplied 
     * document must have set the "id" attribute and can include allthedocumnt properties, or only the 
     * ones to be updated.
     */
    update(modelName: string, args: any): Promise<any>

    /**
     * Returs one item of the model based on his unique key.
     * @param modelName target model name.
     * @param args Argument must include an "id" property with the unique identifier of 
     * the document to retrieve.
     */
    getOne(modelName: string, args: any): Promise<any>

    /**
     * Returns all the elements from the model that applies based on the args filter.
     * @param modelName target model name.
     * @param args Argument must include a "QueryModifier" object with the query details.
     */
    getMany(modelName: string, args: any): Promise<any>

    /**
     * Delete an item from the modelrepository based on his unique identifier.
     * @param modelName target model name.
     * @param args Argument must include an "_id" property with the unique identifier of 
     * the document to delete.
     */
    delete(modelName: string, args: any): Promise<any>
}