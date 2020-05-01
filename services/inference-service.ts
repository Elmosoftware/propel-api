import { join } from "path";

import { cfg } from "../core/config";
import { InvocationService } from "./invocation-service";
import { FileSystemHelper } from "../util/file-system-helper";
import { ScriptParameter } from "../models/script-parameter";
import { logger } from "./logger-service";
import { Disposable } from "../core/disposable";
import { Utils } from "../util/utils";

/**
 * This class encapsulates all teh functionality related to Script parameter inference used in the API.
 * @implements Disposable
 */
export class InferenceService implements Disposable {

    private _invsvc: InvocationService;

    constructor() {
        this._invsvc = new InvocationService();
    }

    /**
     * Returns a collection of script parameters, (if any), with alll the attributes as defined in 
     * the script. 
     * @param scriptBody Script body, (code), from which we ant to infer the parameters.
     */
    infer(scriptBody: string): Promise<ScriptParameter[]> {

        return new Promise<ScriptParameter[]>((resolve, reject) => {

            let ret: ScriptParameter[] = [];

            //Sadly for thsi we will need to persist the script in the file system, so firts 
            //step is to create a temp file with the script content.
            FileSystemHelper.createTempFile("infer-", "ps1", scriptBody)
                .then((fileName) => {
                    let command = join(cfg.rootFolder, cfg.PSScriptsFolder, "get-parameters.ps1");
                    let params = [
                        { name: "Path", value: fileName }
                    ]

                    logger.logInfo(`Temporal file created: "${fileName}".`);

                    // this._invsvc.addSTDOUTEventListener((msg: InvocationMessage) => {
                    //     console.log(msg.toString());
                    // })

                    this._invsvc.invoke(command, params)
                        .then((params: any[]) => {

                            if (params && params.length > 0) {
                                params.forEach((param) => {

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
                                            sp.defaultValue = param.DefaultValue;
                                        }
                                        
                                        ret.push(sp);
                                    }
                                })
                            }

                            resolve(ret)
                        })
                        .catch((err) => {
                            reject(err);
                        })
                        .finally(() => {
                            FileSystemHelper.delete(fileName)
                                .then(() => {
                                    logger.logInfo(`Temporal file "${fileName}" was deleted successfully.`);
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
        });
    }

    disposeSync() {
        this._invsvc.disposeSync();
    }

    dispose() {
        return this._invsvc.dispose();
    }
}