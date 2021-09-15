import { CredentialCache } from "../../services/credential-cache";
import { Credential } from "../../../propel-shared/models/credential";
import { testingWorkflows } from "./testing-workflows";
import { Secret } from "../../../propel-shared/models/secret";
import { SecretValue } from "../../../propel-shared/models/secret-value";
import { WindowsSecret } from "../../../propel-shared/models/windows-secret";
import { AWSSecret } from "../../../propel-shared/models/aws-secret";
import { ParameterValue } from "../../../propel-shared/models/parameter-value";
import { Workflow } from "../../../propel-shared/models/workflow";


let w = new WindowsSecret()
let y = new AWSSecret()

function getTestCredentialCache(credentialsToRemove: number = 0, secretsToRemove: number = 0): CredentialCache {
    let ret: CredentialCache = new CredentialCache();
    let tw = testingWorkflows;
    //Mocking the private methods with DB calls:

    //@ts-ignore
    ret.getCredentialsById = async (credentialIds: string[]): Promise<Credential[]> => {
        let ret: Credential[] = []

        credentialIds.forEach((id: string) => {
            //@ts-ignore
            ret.push(tw[id]) //Always ensure the Credential name is the same as the property "_id"!
        })

        if (credentialsToRemove > 0) {
            if (credentialsToRemove < ret.length ) {
                ret.splice(credentialsToRemove); //Removing the last elements.
            }
            else {
                ret = []; //Removing all elements.
            }
        }
        
        return ret; //Here, (for a positive case), we expect to have only the credentials 
        //in $PropelCredentials.
    }

    //@ts-ignore
    ret.getSecretsById = async (secretIds: string[]): Promise<Secret<SecretValue>[]> => {
        let ret: Secret<SecretValue>[] = []

        secretIds.forEach((name: string) => {
            //@ts-ignore
            ret.push(tw[name])
        })

        if (secretsToRemove > 0) {
            if (secretsToRemove < ret.length ) {
                ret.splice(secretsToRemove); //Removing the last elements.
            }
            else {
                ret = []; //Removing all elements.
            }
        }
        
        return ret;  //Here, (for a positive case), we expect to have all the 
        //credentials secrets. The ones in the $PropelCredentials and the ones for the Targets credentials.
    }

    return ret;
}

function getTestWorkflow(propelCredentials: Credential[], totalTargets: number = 2,
    targetsWithCredentials: number = 2): Workflow {

    let ret = Object.assign({}, testingWorkflows.Worflow_S1Enabled2TargetsEnabledWithCredFast); //This 
    //workflow already have defined a $PropelCredentials parameter.
    let pv = new ParameterValue();
    let propelCredentialsValue: string = ""

    pv.name = "PropelCredentials"

    propelCredentials.forEach((cred: Credential, i: number) => {
        propelCredentialsValue += ((i == 0) ? "" : ",") + cred._id;
    })

    pv.value = propelCredentialsValue;
    ret.steps[0].values = [pv];

    if (totalTargets > 2) throw `Parameter "totalTargets" maximum value is 2.`
    if (targetsWithCredentials > totalTargets) throw `Parameter "targetsWithCredentials" can't be greater than "totalTargets".`

    switch (totalTargets) {
        case 0:
            ret.steps[0].targets = []; //Removing all targets
            break;
        case 1:
            ret.steps[0].targets.splice(1); //Removing second target.
            break;
        case 2:
            //Nothing todo here...
            break;
        default:
            throw `Wrong value for parameter "totalTargets".`
    }

    if (targetsWithCredentials < totalTargets) {
        switch (targetsWithCredentials) {
            case 0: //Removing the credentials of all the targets:
                if (ret.steps[0].targets[0]) {
                    //@ts-ignore
                    ret.steps[0].targets[0].invokeAs = null;
                }

                if (ret.steps[0].targets[1]) {
                    //@ts-ignore
                    ret.steps[0].targets[1].invokeAs = null;
                }
                break;
            case 1:  //Removing the credentials of the second target:
                if (ret.steps[0].targets[1]) {
                    //@ts-ignore
                    ret.steps[0].targets[1].invokeAs = null;
                }
                break;
            case 2:
                //Nothing todo here...
                break;
            default:
                throw `Wrong: value for parameter "targetWithCredentials".`
        }
    }

    //At last: CredentialCache is calling the "toObject()" method in the Credential model. We need 
    //to add it in order to avoid the build method to fail:
    ret.steps[0].targets.map((target) => {
        if (target.invokeAs && !(target.invokeAs as any).toObject) {
            //@ts-ignore
            target.invokeAs.toObject = () => target.invokeAs
        }
        return target;
    }) 

    return ret
}

beforeAll(() => {

})

describe("CredentialCache Class - Build", () => {

    describe("Positive cases", () => {

        beforeEach(() => {

        })

        test(`Workflow with: Targets with Cred: 0, Targets without Cred: 0, PropelCredentials: 0`, async () => {

            let cc = getTestCredentialCache();
            let w = getTestWorkflow([], 0, 0);

            await cc.build(w)

            expect(cc.count).toEqual(0);
        });

        test(`Workflow with: Targets with Cred: 0, Targets without Cred: 1, PropelCredentials: 0`, async () => {

            let cc = getTestCredentialCache();
            let w = getTestWorkflow([], 1, 0);

            await cc.build(w)

            expect(cc.count).toEqual(0);
        });

        test(`Workflow with: Targets with Cred: 0, Targets without Cred: 0, PropelCredentials: 1`, async () => {

            let cc = getTestCredentialCache();
            let w = getTestWorkflow([testingWorkflows.CredentialAWS02], 0, 0)

            await cc.build(w)

            expect(cc.count).toEqual(1);
            let ci01 = cc.getById(testingWorkflows.CredentialAWS02._id);
            expect(ci01).not.toBe(undefined);

            expect(ci01?.credential.name).toEqual(testingWorkflows.CredentialAWS02.name);
            expect(ci01?.secret._id).toEqual(ci01?.credential.secretId);
        });

        test(`Workflow with: Targets with Cred: 2, Targets without Cred: 0, PropelCredentials: 1`, async () => {

            let cc = getTestCredentialCache();
            let w = getTestWorkflow([testingWorkflows.CredentialAWS02])

            await cc.build(w)

            let ci01 = cc.getById(testingWorkflows.CredentialWindows01._id);
            let ci02 = cc.getById(testingWorkflows.CredentialAWS02._id);
            let ci03 = cc.getById(testingWorkflows.CredentialWindows03._id);

            expect(cc.count).toEqual(3);

            expect(ci01).not.toBe(undefined);
            expect(ci02).not.toBe(undefined);
            expect(ci03).not.toBe(undefined);

            expect(ci01?.credential._id).toEqual(testingWorkflows.CredentialWindows01._id);
            expect(ci01?.secret._id).toEqual(ci01?.credential.secretId);

            expect(ci02?.credential._id).toEqual(testingWorkflows.CredentialAWS02._id);
            expect(ci02?.secret._id).toEqual(ci02?.credential.secretId);

            expect(ci03?.credential._id).toEqual(testingWorkflows.CredentialWindows03._id);
            expect(ci03?.secret._id).toEqual(ci03?.credential.secretId);
        });

        test(`Workflow with: Targets with Cred: 2, Targets without Cred: 0, PropelCredentials: 2`, async () => {

            let cc = getTestCredentialCache();
            let w = getTestWorkflow([testingWorkflows.CredentialAWS02, testingWorkflows.CredentialWindows03])

            await cc.build(w)

            let ci01 = cc.getById(testingWorkflows.CredentialWindows01._id);
            let ci02 = cc.getById(testingWorkflows.CredentialAWS02._id);
            let ci03 = cc.getById(testingWorkflows.CredentialWindows03._id);

            expect(cc.count).toEqual(3); //Repeated credentials are discarded from the cache automatically, so 
            //because "CredentialWindows03" is repeated we expect to have only 3 in the count.

            expect(ci01).not.toBe(undefined);
            expect(ci02).not.toBe(undefined);
            expect(ci03).not.toBe(undefined);

            expect(ci01?.credential._id).toEqual(testingWorkflows.CredentialWindows01._id);
            expect(ci01?.secret._id).toEqual(ci01?.credential.secretId);

            expect(ci02?.credential._id).toEqual(testingWorkflows.CredentialAWS02._id);
            expect(ci02?.secret._id).toEqual(ci02?.credential.secretId);

            expect(ci03?.credential._id).toEqual(testingWorkflows.CredentialWindows03._id);
            expect(ci03?.secret._id).toEqual(ci03?.credential.secretId);
        });
    });

    describe("Negative cases", () => {

        beforeEach(() => {

        });

        test(`Workflow with: Targets with Cred: 0, Targets without Cred: 0, PropelCredentials: 2. But found only 1 credential`, async () => {

            let cc = getTestCredentialCache(1);
            let w = getTestWorkflow([testingWorkflows.CredentialAWS02, testingWorkflows.CredentialWindows03], 2, 0);
            let e = null;

            try {
                await cc.build(w);
            } catch (error) {
                e = error;
            }
            
            expect(e).not.toBe(null)
            expect(String(e.message)
                    .toLowerCase()
                    .includes(`There was a total of 2 credentials specified in one or more Propel parameters in all the scripts of this workflow. But we found only 1`.toLowerCase()))
                .toBeTruthy();
        });

        test(`Workflow with: Targets with Cred: 0, Targets without Cred: 0, PropelCredentials: 2. But found only 1 credential secret`, async () => {

            let cc = getTestCredentialCache(0, 1);
            let w = getTestWorkflow([testingWorkflows.CredentialAWS02, testingWorkflows.CredentialWindows03], 2, 0);
            let e = null;

            try {
                await cc.build(w);
            } catch (error) {
                e = error;
            }
            
            expect(e).not.toBe(null)
            expect(String(e.message)
                    .toLowerCase()
                    .includes(`There is a total of 2 credentials specified for this Workflow, but we found the secret part for only 1 of them`.toLowerCase()))
                .toBeTruthy();
        });
    });
})