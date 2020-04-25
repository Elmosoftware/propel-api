import { appendFile, close, unlink } from "fs";
import { file } from "tmp";

/**
 * File System utilities.
 */
export class FileSystemHelper {

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
}
