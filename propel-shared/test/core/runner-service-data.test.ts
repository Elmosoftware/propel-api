import { RunnerServiceData } from "../../core/runner-service-data"
import { ParameterValue } from "../../models/parameter-value"
import { RuntimeParameters } from "../../models/runtime-parameters"

function createRPs(steps: number, paramsPerStep: number): RuntimeParameters[] {
    let ret: RuntimeParameters[] = []

    for (let stepIndex = 0; stepIndex < steps; stepIndex++) {
        let rp: RuntimeParameters = new RuntimeParameters()
        rp.stepIndex = stepIndex

        for (let paramIndex = 0; paramIndex < paramsPerStep; paramIndex++) {
            let pv = new ParameterValue()
            pv.isRuntimeParameter = true;
            pv.name = `STEP${stepIndex}PV${paramIndex}`
            pv.value = pv.name
            rp.values.push(pv)       
        } 
        
        ret.push(rp);
    }

    return ret;
}

describe("RunnerServiceData Class - Constructor", () => {
    let data: RunnerServiceData

    beforeEach(() => {
        data = new RunnerServiceData()
    })

    test(`No parameters`, () => {
        expect(data.workflowId).toEqual("");
        expect(data.runtimeParameters.length).toEqual(0);
    })

    test(`workflowId string parameter`, () => {
        data = new RunnerServiceData("x")
        expect(data.workflowId).toEqual("x");
        expect(data.runtimeParameters.length).toEqual(0);
    })

    test(`workflowId non-string parameter`, () => {
        let d = new Date()
        //@ts-ignore
        data = new RunnerServiceData(d)
        expect(data.workflowId).toEqual(d.toString());
        expect(data.runtimeParameters.length).toEqual(0);
    })

    test(`runtimeParameter array parameter`, () => {
        let rps: RuntimeParameters[] = createRPs(2, 4)
        data = new RunnerServiceData(undefined, rps)
        expect(data.workflowId).toEqual("");
        expect(data.runtimeParameters.length).toEqual(2);
        expect(data.runtimeParameters[0].stepIndex).toEqual(rps[0].stepIndex);
        expect(Array.isArray(data.runtimeParameters[0].values)).toBe(true);
        expect(data.runtimeParameters[0].values.length).toEqual(rps[0].values.length);
    })
})

describe("RunnerServiceData Class - hydrate()", () => {
    let data: RunnerServiceData

    beforeEach(() => {
        data = new RunnerServiceData()
    })

    test(`Null reference`, () => {
        expect(() => {
            //@ts-ignore
            data.hydrate(null)
        }).toThrow(`The provided service data object is`);
    })

    test(`Invalid format - No workflowId attribute`, () => {
        expect(() => {
            //@ts-ignore
            data.hydrate({runtimeParameters:[]})
        }).toThrow(`The provided service data object is`);
    })

    test(`Invalid format - No runtimeParameters attribute`, () => {
        expect(() => {
            //@ts-ignore
            data.hydrate({workflowId:"xxxxx"})
        }).toThrow(`The provided service data object is`);
    })

    test(`Invalid format - No Array runtimeParameters attribute`, () => {
        expect(() => {
            //@ts-ignore
            data.hydrate({workflowId:"xxxxx", runtimeParameters:23})
        }).toThrow(`The provided service data object is`);
    })

    test(`Valid format`, () => {
        let rps = createRPs(1, 1)
        //@ts-ignore
        data.hydrate({workflowId:"id", runtimeParameters:rps})
        expect(data.workflowId).toEqual("id");
        expect(data.runtimeParameters.length).toEqual(1);
        expect(data.runtimeParameters[0].stepIndex).toEqual(rps[0].stepIndex);
        expect(data.runtimeParameters[0].values.length).toEqual(rps[0].values.length);
        expect(data.runtimeParameters[0].values[0].name).toEqual(rps[0].values[0].name);
    })
})

describe("RunnerServiceData Class - getParameter()", () => {
    let data: RunnerServiceData

    beforeEach(() => {
        data = new RunnerServiceData()
    })

    test(`Searching an empty RunnerServiceData`, () => {
        expect(data.getParameter(0, "My parameter")).toBeUndefined()
    })

    test(`Searching a not empty RunnerServiceData - Unknown parameter`, () => {
        let rps = createRPs(3, 5)
        //@ts-ignore
        data.hydrate({workflowId:"id", runtimeParameters:rps})
        expect(data.getParameter(0, "unknown parameter")).toBeUndefined()
    })

    test(`Searching a not empty RunnerServiceData - Known parameter`, () => {
        let rps = createRPs(3, 5)
        //@ts-ignore
        data.hydrate({workflowId:"id", runtimeParameters:rps})
        expect(data.getParameter(0, "STEP0PV3")).toBeDefined()
        expect(data.getParameter(0, "STEP0PV3")?.name).toEqual(rps[0].values[3].name)
        expect(data.getParameter(2, "STEP2PV4")).toBeDefined()
        expect(data.getParameter(2, "STEP2PV4")?.name).toEqual(rps[2].values[4].name)
        expect(data.getParameter(3, "STEP3PV0")).toBeUndefined()
    })

    
    
})

