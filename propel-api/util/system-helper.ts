import * as crypto from "crypto";
import { appendFile, close, unlink } from "fs";
import { file } from "tmp";
import { exec } from "child_process";
import { PropelError } from "../../propel-shared/core/propel-error";
import { Utils } from "../../propel-shared/utils/utils";
import { RuntimeTokenKeys } from "../../propel-shared/core/runtime-token-keys";

/**
 * File System utilities.
 */
export class SystemHelper {

    constructor(){
    }

    /**
     * Creates a file in the current OS temp folder with optional content.
     * Returns the file full name.
     * @param prefix Prefix to use for the temporal file.
     * @param extension extension of the temporal file.
     * @param content Temporal file content.
     */
    static createTempFile(prefix?: string, extension?: string, content?: string): Promise<string> {

        content = (content) ? String(content) : "";
        prefix = (prefix) ? String(prefix) : "";

        if (extension) {
            extension = (String(extension)[0] == ".")? String(extension) : `.${extension}`
        }
        else {
            extension = ""
        }        

        return new Promise<string>((resolve, reject) => {
            //Creating temp file:
            file({ prefix: prefix, postfix: extension }, (err: any, fileName: string, fd: number) => {
                if (err) {
                    reject(err);
                }
                //Appending content, (if any), and closing the file:
                else {
                    this.writeTo(fd, String(content))
                        .then(() =>{
                            resolve(fileName);
                        })
                        .catch((err) =>{
                            reject(err);
                        });
                }                
            });
        });
    }

    /**
     * Write the specified content in the specified file. If you provide a file handle, (instead of 
     * a file name), you can specify to keep the file opened by setting to false the 
     * parameter "closeAfterIfHandle".
     * @param fileNameOrHandle Full file name or a handle of an already opened file in write mode.
     * @param content Content to save in the file.
     * @param closeAfterIfHandle Indicate if the file will be closed after writing it. This will 
     * be done ONLY if a file handle is provided instead of a file name. If what was provided 
     * was a file name, the file will be closed always automatically after the write operation.
     */
    static writeTo(fileNameOrHandle: string | number, content: string, closeAfterIfHandle: boolean = true): Promise<void>{

        let isHandle: boolean = Boolean(typeof fileNameOrHandle === "number");

        return new Promise<void>((resolve, reject) => {

            appendFile(fileNameOrHandle, content, (err) => {
                if (err) {
                    reject(err);
                }
                else if(isHandle && closeAfterIfHandle) {
                    close(Number(fileNameOrHandle), (err) => {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve();
                        }
                    });
                }
                else {
                    resolve();
                }
            });
        });
    }

    /**
     * Deletes the specified file or throw an error otherwise.
     * @param fileName File to delete.
     */
    static delete(fileName: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            unlink(fileName, (err) => {
                if (err) {
                    reject(err);
                }
                else{
                    resolve()
                }
            })
        });
    }

    /**
     * Returns a Base64 encoding of the supplied ASCII string.
     * @param ASCIIString String value to be Base64 encoded.
     */
    static encodeBase64(ASCIIString: string): string{
        
        if (typeof ASCIIString !== "string") {
            throw new PropelError(`We expect a "string" for the parameter "ASCIIString". Supplied value type: "${typeof ASCIIString}".`)
        }
  
        return Buffer.from(ASCIIString, "utf8").toString("base64");
    }
    
    /**
     * Decodes the provided Base64 encoded string.
     * @param base64String String value to be decoded.
     */
    static decodeBase64(base64String: string): string{
        
        if (typeof base64String !== "string") {
            throw new PropelError(`We expect a "string" for the parameter "base64String". Supplied value type: "${typeof base64String}".`)
        }
  
        return Buffer.from(base64String, "base64").toString("utf8");
    }

    static decrypt(message: string, rtk: RuntimeTokenKeys): string {
        let dec = crypto.createDecipheriv(rtk.alg, rtk.key, rtk.iv);
        return dec.update(message, "hex", "utf-8") + dec.final("utf8");
    }

    /**
     * Kills a process on a Windows OSby using the "taskkill" command.
     * @param processId Process Id
     */
    static killProcess(processId: number): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            exec(`taskkill /PID ${processId} /t /f`, (error, stdout) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(stdout);
                }
            });
        })
    }

    /**
     * Escapes a regular expression string.
     * This is based on the proposal by [benjamingr](https://github.com/benjamingr) you can find [here](https://github.com/tc39/proposal-regex-escaping).
     */
    static RegExpEscape(regExpString: string): string{
        return String(regExpString).replace(/[\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    /**
     * This method try to detect JSON as part of a multiline text. If a valid JSON is detected
     * it will be returned, otherwise this method will return an empty string.
     * As a valid JSON we are going to consider only an object or object array. Consider the below examples
     *      `This is a
     *      multiline with JSON object in next line
     *      { "myData": "This is my data" }
     *      And another line at the end`
     * For that case this function will return: `{"myData":"This is my data" }`
     * @param text Text to check.
     */
    static detectJSON(text: string): string {

        let ret = "";

        if (!text || typeof text !== "string") return text;

        let arr = text.split("\n") //Splitting by lines.
            .map((t) => t.replace(/[\r\t\f]/gi, "")); //Removing special chars.

        for (let i = arr.length - 1; i >= 0; i--) {
            //If seems to be a JSON:
            if ((arr[i].startsWith("{") && arr[i].endsWith("}")) ||
                (arr[i].startsWith("[{") && arr[i].endsWith("}]"))) {
                //We try it:
                if (Utils.isValidJSON(arr[i])) {
                    ret = arr[i];
                    break;
                }
            }
        }

        return ret;
    }
}
