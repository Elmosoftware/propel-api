/**
 * Credential types stored in the application.
 */
export enum CredentialTypes {
    Windows = "Windows",
    AWS = "AWS",
    APIKey = "APIKey",
    Database = "Database"
}

/**
 * Default credential type
 */
export let DEFAULT_CREDENTIAL_TYPE = CredentialTypes.Windows