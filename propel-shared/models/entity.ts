// @ts-check

/**
 * This is the most basic entity definition. All persisted entities ust inherit this common set.
 */
export class Entity {

    /**
     * Entity unique identifier.
     */
    public _id: string = "";

    /**
     * This is an internal field used for the soft deletion feature. 
     */
    public deletedOn: Date | null = null;

    constructor() {
    }
}