import { PropelAppError } from "../core/propel-app-error";

/**
 * File System utilities.
 */
export class SystemHelper {

    constructor(){
    }

    /**
     * Returns a Base64 encoding of the supplied ASCII string.
     * @param ASCIIString String value to be Base64 encoded.
     */
    static encodeBase64(ASCIIString: string): string{
        
        if (typeof ASCIIString !== "string") {
            throw new PropelAppError(`We expect a "string" for the parameter "ASCIIString". Supplied value type: "${typeof ASCIIString}".`)
        }
  
        return window.btoa(ASCIIString);
    }
    
    /**
     * Decodes the provided Base64 encoded string.
     * @param base64String String value to be decoded.
     */
    static decodeBase64(base64String: string): string{
        
        if (typeof base64String !== "string") {
            throw new PropelAppError(`We expect a "string" for the parameter "base64String". Supplied value type: "${typeof base64String}".`)
        }
  
        return window.atob(base64String);
    }
}
