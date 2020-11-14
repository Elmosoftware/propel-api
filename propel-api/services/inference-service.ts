import { join } from "path";

import { cfg } from "../core/config";
import { pool } from "../services/invocation-service-pool";
import { SystemHelper } from "../util/system-helper";
import { ScriptParameter } from "../../propel-shared/models/script-parameter";
import { logger } from "../services/logger-service";
import { Utils } from "../../propel-shared/utils/utils";
import { InvocationService } from "./invocation-service";

/**
 * This class encapsulates all teh functionality related to Script parameter inference used in the API.
 * @implements Disposable
 */
export class InferenceService {

    constructor() {

    }

    /**
     * Returns a collection of script parameters, (if any), with alll the attributes as defined in 
     * the script. 
     * @param scriptBody Script body, (code), from which we ant to infer the parameters.
     */
    infer(scriptBody: string): Promise<ScriptParameter[]> {

        return new Promise<ScriptParameter[]>((resolve, reject) => {

            let ret: ScriptParameter[] = [];

            pool.aquire()
                .then((invsvc: InvocationService) => {

                    logger.logDebug(`Starting temp file creation.`)

                    //Sadly for this we will need to persist the script in the file system, so first 
                    //step is to create a temp file with the script content.
                    SystemHelper.createTempFile("infer-", "ps1", scriptBody)
                        .then((fileName) => {
                            let command = join(cfg.rootFolder, cfg.PSScriptsFolder, "get-parameters.ps1");
                            let params = [
                                { name: "Path", value: fileName }
                            ]

                            logger.logDebug(`Temp file created. Command to run: "${command} -${params[0].name} ${params[0].value}".\r\nStarting command execution.`);

                            invsvc.invoke(command, params)
                                .then((data: string) => {

                                    let params: any = Utils.detectJSON(data);

                                    if (params && Utils.isValidJSON(params)) {
                                        params = JSON.parse(params);
                                        //If the script has one single param, even when we returned an array in our PS script, PowerShell 
                                        //is converting the array in a single object with the "ConvertTo-JSON" commandlet. 
                                        //So we need to double check here:
                                        if (!Array.isArray(params)) {
                                            params = [params];
                                        }
                                    }
                                    else {
                                        logger.logError(`Returned data IS NOT JSON. The inference parameters process failed.`)
                                    }

                                    if (params && params.length > 0) {
                                        params.forEach((param: any) => {

                                            if (!isNaN(param.Position) && param.Name) {
                                                let sp = new ScriptParameter();

                                                sp.position = param.Position;
                                                sp.name = param.Name;
                                                sp.description = (param.HelpMessage) ? param.HelpMessage : "";
                                                sp.type = param.ParameterType;
                                                sp.nativeType = Utils.powershellToJavascriptTypeConverter(sp.type);
                                                sp.required = param.IsMandatory;
                                                sp.validValues = param.ValidValues;
                                                sp.canBeNull = param.CanBeNull;
                                                sp.canBeEmpty = param.CanBeEmpty;

                                                if (param.DefaultValue !== null) {
                                                    sp.hasDefault = true;
                                                    sp.defaultValue = param.DefaultValue;
                                                }

                                                ret.push(sp);
                                            }
                                        })
                                    }

                                    resolve(ret)
                                })
                                .catch((err: any) => {
                                    reject(err);
                                })
                                .finally(() => {
                                    
                                    //Returning the InvocationService instance to the pool:
                                    pool.release(invsvc);

                                    //Deleting temp files:
                                    SystemHelper.delete(fileName)
                                        .then(() => {
                                            //Temp file deleted successfully!
                                        })
                                        .catch((err) => {
                                            logger.logWarn(`There was an error while trying to delete the temporal file "${fileName}" this is not critical.
Error details: ${String(err)}`);
                                        })
                                });
                        })
                        .catch((err) => {
                            reject(err);
                        })
                })
                .catch((err: any) => {
                    reject(err);
                })
        });
    }
}