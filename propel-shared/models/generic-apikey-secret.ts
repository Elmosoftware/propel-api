import { SecretValue } from "./secret-value";

/**
 * This holds the secret part of a generic API Key.
 */
export class GenericAPIKeySecret extends SecretValue{

    /**
     * Application Id.
     */
     appId: string = "";

    /**
     * API Secret key.
     */
     apiKey: string = "";

    constructor() {
        super();
    }
}