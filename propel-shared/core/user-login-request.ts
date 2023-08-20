import { PropelError } from "./propel-error";

export class UserLoginRequest {

    /**
     * Runtime token.
     */
    runtimeToken: string = "";

    constructor(token?: string) {
        if (token) {
            this.runtimeToken = token;
        }
    }
}
