// @ts-check

/**
 * This is the most basic entity definition. All persisted entities ust inherit this common set.
 */
export class Entity {

    /**
     * Entity unique identifier.
     */
    public _id: string = "";

    constructor() {
    }
}

/**
 * Helper function to compare one entity instance with another. This will return true if 
 * both are fererring to the same entity.
 * @param a First entity to compare.
 * @param b Entity to compare to.
 */
export function compareEntities(a: Entity, b: Entity): boolean {
    return a._id == b._id;
}