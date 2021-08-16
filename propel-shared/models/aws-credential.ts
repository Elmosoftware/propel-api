import { CredentialBase } from "./credential-base";
import { CredentialTypes } from "./credential-types";

/**
 * Amazon Web Services credentials for an AWS account.
 */
export class AWSCredential extends CredentialBase {

    secret: AWSSecret = new AWSSecret()

    constructor() {
        super();
        this.type = CredentialTypes.AWS;
    }
}

/**
 * The AWS secret stores the access and secret keys of a aws account.
 */
export class AWSSecret {

    /**
     * AWS account Access Key.
     */
    accessKey: string = "";

    /**
     * AWS account Secret key.
     */
    secretKey: string = "";

    constructor() {

    }
}