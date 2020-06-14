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