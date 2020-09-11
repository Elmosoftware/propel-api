import { WorkflowStep } from '../../../propel-shared/models/workflow-step';
import { ExecutionStep } from '../../../propel-shared/models/execution-step';
import { ExecutionTarget } from '../../../propel-shared/models/execution-target';
import { Target } from '../../../propel-shared/models/target';
import { ParameterValue } from '../../../propel-shared/models/parameter-value';

/**
 * UI Helper class.
 */
export class UIHelper {

    constructor() {
    }

    /**
     * Returns a comma separated list of target names at least the "useFQDN" is specified.
     * @param useFQDN If true, the list is going to contain target FQDN's, otherwise it will 
     * return the friendly names.
     */
    static getTargetList(step: WorkflowStep | ExecutionStep, useFQDN: boolean = false): string {

        let ret: string = "None";

        if (step.targets && step.targets.length > 0) {
            ret = (step.targets as any[])
                .map((t: any) => {
                    if (useFQDN) return t.FQDN;
                    else return (t.friendlyName) ? t.friendlyName : t.name;
                })
                .join();
        }

        return ret;
    }

    static getParameterValuesList(values: ParameterValue[]): string {
        let ret: string = "None";

        if (values && values.length > 0) {
            ret = values.map((pv: ParameterValue) => {
                let quotes: string = (pv.nativeType == "String") ? `"` : "";
                return `${pv.name} = ${quotes}${pv.value}${quotes}`;
            })
            .join();
        }

        return ret;
    }

}