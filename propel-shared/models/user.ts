// @ts-check
import { Entity } from "./entity";

export class User extends Entity {

    /**
     * User full name
     */
    public name: string = "";

    /**
     * User Email. This will be used as the unique user identifier.
     */
    public email: string = "";

    /**
     * User initials, for user avatar, picture subtext, etc. 
     */
    public initials: string = "";

    /**
     * User picture URL.
     */
    public picture: string = "";

    constructor() {
        super();
    }
}