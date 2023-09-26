//@ts-check
import { ParameterValue } from "../models/parameter-value";
import { RuntimeParameters } from "../models/runtime-parameters";
import { PropelError } from "./propel-error";

/**
 * This class provides the necessary data to the API RunnerService to execute a Workflow or Quick task.
 */
export class RunnerServiceData {

    /**
     * Id of the workflow to execute.
     */
    public workflowId: string = "";

    /**
     * If the workflow has defined some runtime parameters, we need to pass here the values to 
     * use in the execution.
     */
    public runtimeParameters: RuntimeParameters[] = []

    /**
     * Parameterized constructor
     * @param workflowId Identifier of the Workflow or Quick task to run.
     * @param runtimeParameters Optional collection of runtime parameters.
     */
    constructor(workflowId?: string, runtimeParameters?: RuntimeParameters[]) {
        this.workflowId = String(workflowId ?? this.workflowId)
        if (runtimeParameters && Array.isArray(runtimeParameters)) {
            this.runtimeParameters = new Array(...runtimeParameters);
        }
    }

    /**
     * This method allows to set the collection of RuntimeParameters from a plane object or array.
     * @param obj RuntimeParameters or RuntimeParameters[] instance.
     */
    hydrate(obj: any): void {
        if (!obj || !obj.workflowId || !obj.runtimeParameters || !Array.isArray(obj.runtimeParameters))
            throw new PropelError(`The provided service data object is a null reference or it has an 
invalid format.`);

        this.workflowId = String(obj.workflowId);
        this.runtimeParameters = new Array(...obj.runtimeParameters);
    }

    getParameter(stepIndex: number, parameterName: string): ParameterValue | undefined {
        return this.runtimeParameters
            .find((rps: RuntimeParameters) => rps.stepIndex == stepIndex)
            ?.values.find((pv: ParameterValue) => pv.name.toLowerCase() == String(parameterName).toLowerCase())
    }
}