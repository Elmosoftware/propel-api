/**
 * Keys used for runtime token encryption.
 */
export type RuntimeTokenKeys = {
    /**
     * Cypher algorythm.
     */
    alg: string,
    
    /**
     * Encryption key.
     */
    key: string,

    /**
     * Initialiation vector.
     */
    iv: string
}