import { SecretValue } from "./secret-value";

/**
 * The AWS secret stores the access and secret keys of an AWS account.
 */
export class AWSSecret extends SecretValue{

    /**
     * AWS account Access Key.
     */
    accessKey: string = "";

    /**
     * AWS account Secret key.
     */
    secretKey: string = "";

    constructor() {
        super();
    }
}