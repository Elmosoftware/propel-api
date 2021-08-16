/**
 * Credential types stores in the application.
 */
export enum CredentialTypes {
    Generic = "Generic",
    AWS = "AWS"
}

/**
 * Default credential type
 */
export let DEFAULT_CREDENTIAL_TYPE = CredentialTypes.Generic