import { join } from "path";
import { cfg } from "../core/config";
import { pool } from "./powershell-service-pool";
import { SystemHelper } from "../util/system-helper";
import { ScriptParameter } from "../../propel-shared/models/script-parameter";
import { logger } from "./logger-service";
import { Utils } from "../../propel-shared/utils/utils";
import { PowerShellService } from "./powershell-service";
import { ErrorCodes } from "../../propel-shared/core/error-codes";
import { PropelError } from "../../propel-shared/core/propel-error";

/**
 * This class encapsulates all teh functionality related to Script parameter inference used in the API.
 * @implements Disposable
 */
export class ParamInferenceService {

    constructor() {

    }

    /**
     * Returns a collection of script parameters, (if any), with all the attributes as defined in 
     * the script. 
     * @param scriptBody Script body, (script code), from which we want to infer the parameters.
     */
    async infer(scriptBody: string): Promise<ScriptParameter[]> {

        let ret: ScriptParameter[] = [];
        let svc!: PowerShellService;
        let fileName!: string;
        let command: string;

        try {
            logger.logInfo(`Starting parameter inference process...`)
            svc = await pool.aquire()

            logger.logDebug(`Creating temp file...`)
            //Sadly for this we will need to persist the script in the file system, so first 
            //step is to create a temp file with the script content.
            fileName = await SystemHelper.createTempFile("infer-", "ps1", scriptBody);
            command = join(cfg.rootFolder, cfg.PSScriptsFolder, "get-parameters.ps1")
                + ` -Path "${fileName}"`
            logger.logDebug(`Temp file created. Command to run: "${command}".
            Starting command execution.`);
            ret = this.parseParameters(await svc.invoke(command));
            logger.logInfo(`Parameters inference process is done. Parameters found: ${ret.length}.`)
        } catch (error) {
            logger.logInfo(`Parameters inference process finished with error. Error details: "${String(error)}".`)
            return Promise.reject(error)
        }
        finally {
            //Returning the InvocationService instance to the pool:
            if (svc!) pool.release(svc);
            //Deleting temp files:
            if (fileName!) {
                SystemHelper.delete(fileName)
                    .catch((error) => {
                        logger.logWarn(`There was an error while trying to delete the temporal file "${fileName}" this is not critical.
Error details: ${String(error)}`);
                    })
            }
        }

        return Promise.resolve(ret);
    }

    private parseParameters(commandResults: string): ScriptParameter[] {

        let ret: ScriptParameter[] = []
        let params: any = SystemHelper.detectJSON(commandResults);

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
            logger.logDebug(`This is the received data: "${commandResults}".`)
        }

        if (!params || !params.length || params.length == 0) return ret;

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
                sp.isPropelParameter = false;

                if (param.DefaultValue !== null) {
                    sp.hasDefault = true;
                    sp.defaultValue = param.DefaultValue;
                }

                if (cfg.isPropelParam(sp.name)) {
                    if (sp.validValues.length > 0 || sp.type != "System.Object" || sp.hasDefault) {
                        throw new PropelError(`Invalid "${cfg.PSScriptPropelParam}" parameter.`, ErrorCodes.WrongPropelParameter);
                    }
                    else { //Is a valid $Propel parameter:
                        sp.isPropelParameter = true;
                        //If there is no help message, we will provide a customized one:
                        if (sp.description == "") {
                            sp.description = `This parameter is managed by Propel. The value is going to be set automatically by Propel on runtime per each one of the requested credentials. If you have doubts about which credentials to select here, please contact the script owner.`
                        }
                    }
                }

                ret.push(sp);
            }
        })

        return ret;
    }
}