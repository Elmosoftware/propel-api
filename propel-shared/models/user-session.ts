// @ts-check
import { Entity } from "./entity";
import { UserAccount } from "./user-account";

/**
 * Full log of Workflow execution outcomes.
 */
export class UserSession extends Entity {

    /**
     * User account.
     */
    public user!: UserAccount;

    /**
     * Session start timestamp.
     */
     public startedAt!: Date;

    constructor() {
        super();
    }
}