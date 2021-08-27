/**
 * The AWS secret stores the access and secret keys of an AWS account.
 */
export class AWSVaultItem {

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