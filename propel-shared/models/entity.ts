// @ts-check

/**
 * This is the most basic entity definition. All persisted entities ust inherit this common set.
 */
export class Entity {

    /**
     * Entity unique identifier.
     */
    public _id: string = "";

    /*
        NOTE: Recall internal only entity attributes must notbe placed here.
        That's why "deletedOn" an "deletedBy" are not included here.
    */

    constructor() {
    }
}

/**
 * Helper function to compare one entity instance with another. This will return true if 
 * both are fererring to the same entity.
 * @param a First entity to compare or an string with the Entity identifiers.
 * @param b Entity to compare against or also his identifier.
 */
export function compareEntities(a: Entity | string, b: Entity | string): boolean {
    let aId: string = (a && (a as Entity)._id) ? (a as Entity)._id : String(a);
    let bId: string = (b && (b as Entity)._id) ? (b as Entity)._id : String(b);

    // return a._id == b._id;
    return aId == bId;
}