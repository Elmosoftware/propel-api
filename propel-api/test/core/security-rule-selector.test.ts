import { HTTPMethods } from "../../core/http-methods";
import { SecurityRuleInput, SecurityRuleSelector } from "../../core/security-rule-selector";
import { UserAccountRoles } from "../../../propel-shared/models/user-account-roles";
import { DataRequestAction } from "../../../propel-shared/core/data-request";
import { Route } from "../../core/route";
import { AuthStatus, RulePreventLogic, SecurityRule } from "../../core/security-rule";
import express, { Router } from "express";
import { LogLevel } from "../../core/config";
import { SecurityToken } from "../../../propel-shared/core/security-token";
import { REQUEST_TOKEN_KEY } from "../../core/middleware";

class WithoutSecurityRoute implements Route {
    name: string = "NoSecurity";
    path: string = "/api/nosec";
    security: SecurityRule[] = []
    handler(): Router {
        return express.Router();
    }
}

describe("SecurityRuleSelector Class - matchMethod()", () => {

    let testRoute: Route;

    beforeEach(() => {
        process.env.LOGGING_LEVEL = LogLevel.Error //Setting the logging level to "Error"
        //to void having a flood of logging messages during the test.
        //You can comment the line if you wouldlike to see extra details.
        testRoute = new WithoutSecurityRoute();
    })

    test(`Throw if no rule is specified.`, () => {
        expect(() => {
            //@ts-ignore
            let sre = new SecurityRuleSelector(null);
        }).toThrow(`We expect a collection of Routes`);
    });
    test(`Throw if no method is specified.`, () => {
        expect(() => {

            testRoute.security.push({
                matchFragment: "/*",
                matchMethods: [HTTPMethods.Post],
                preventDataActions: [],
                preventRoles: [],
                preventLogic: RulePreventLogic.Or
            });
            
            let sre = new SecurityRuleSelector([testRoute]);

            sre.matchMethod(testRoute.security[0], "");
        }).toThrow(`We expect a HTTP method`);
    });
    test(`Match any methods if the rule "methods" list is empty.`, () => {
        testRoute.security.push({
            matchFragment: "/*",
            matchMethods: [],
            preventDataActions: [],
            preventRoles: [],
            preventLogic: RulePreventLogic.Or
        });
        
        let sre = new SecurityRuleSelector([testRoute]);

        expect(sre.matchMethod(testRoute.security[0], HTTPMethods.Connect)).toBe(true);
    });
    test(`Match the method when is in the "methods" list.`, () => {
        testRoute.security.push({
            matchFragment: "/*",
            matchMethods: [HTTPMethods.Post, HTTPMethods.Connect, HTTPMethods.Get],
            preventDataActions: [],
            preventRoles: [],
            preventLogic: RulePreventLogic.Or
        });
        
        let sre = new SecurityRuleSelector([testRoute]);
       
        expect(sre.matchMethod(testRoute.security[0], HTTPMethods.Connect)).toBe(true);
    });
    test(`Do not match the method if is not in the "methods" list.`, () => {
        testRoute.security.push({
            matchFragment: "/*",
            matchMethods: [HTTPMethods.Post, HTTPMethods.Connect, HTTPMethods.Get],
            preventDataActions: [],
            preventRoles: [],
            preventLogic: RulePreventLogic.Or
        });       

        let sre = new SecurityRuleSelector([testRoute]);

        expect(sre.matchMethod(testRoute.security[0], HTTPMethods.Patch)).toBe(false);
    });
})

describe("SecurityRuleSelector Class - preventsUserRole()", () => {

    let testRoute: Route;

    beforeEach(() => {
        process.env.LOGGING_LEVEL = LogLevel.Error //Setting the logging level to "Error"
        //to void having a flood of logging messages during the test.
        //You can comment the line if you wouldlike to see extra details.
        testRoute = new WithoutSecurityRoute();
    })
    
    test(`Returns "false" if no user role specified in the security rule.`, () => {

        testRoute.security.push({
            matchFragment: "/*",
            matchMethods: [],
            preventDataActions: [],
            preventRoles: [],
            preventLogic: RulePreventLogic.Or
        });       
         
        let sre = new SecurityRuleSelector([testRoute]);
        expect(sre.preventsUserRole(testRoute.security[0])).toBe(false);
    });
    test(`Returns "false" if no prevent roles specified in the security rule.`, () => {
        testRoute.security.push({
            matchFragment: "/*",
            matchMethods: [],
            preventDataActions: [],
            preventRoles: [],
            preventLogic: RulePreventLogic.Or
        });       
         
        let sre = new SecurityRuleSelector([testRoute]);
        let st = new SecurityToken();
        st.role = UserAccountRoles.Administrator;
        expect(sre.preventsUserRole(testRoute.security[0], st)).toBe(false);
    });
    test(`Returns "false" if the user role is not in the prevent roles list.`, () => {
        testRoute.security.push({
            matchFragment: "/*",
            matchMethods: [],
            preventDataActions: [],
            preventRoles: [UserAccountRoles.User],
            preventLogic: RulePreventLogic.Or
        });       
         
        let sre = new SecurityRuleSelector([testRoute]);
        let st = new SecurityToken();
        st.role = UserAccountRoles.Administrator;
        expect(sre.preventsUserRole(testRoute.security[0], st)).toBe(false);
    });
    test(`Returns "true" if the user role is in the prevent roles list.`, () => {
        testRoute.security.push({
            matchFragment: "/*",
            matchMethods: [],
            preventDataActions: [],
            preventRoles: [UserAccountRoles.Administrator],
            preventLogic: RulePreventLogic.Or
        });       
         
        let sre = new SecurityRuleSelector([testRoute]);
        let st = new SecurityToken();
        st.role = UserAccountRoles.Administrator;
        expect(sre.preventsUserRole(testRoute.security[0], st)).toBe(true);
    });
    test(`Returns "true" if no security token was provided and Anonymous users must be prevented.`, () => {
        testRoute.security.push({
            matchFragment: "/*",
            matchMethods: [],
            preventDataActions: [],
            preventRoles: [AuthStatus.Anonymous],
            preventLogic: RulePreventLogic.Or
        });       
         
        let sre = new SecurityRuleSelector([testRoute]);
        expect(sre.preventsUserRole(testRoute.security[0], undefined)).toBe(true);
    });
    test(`Returns "true" if a security token was provided and we get a user with any role.`, () => {
        testRoute.security.push({
            matchFragment: "/*",
            matchMethods: [],
            preventDataActions: [],
            preventRoles: [AuthStatus.Authenticated],
            preventLogic: RulePreventLogic.Or
        });       
         
        let sre = new SecurityRuleSelector([testRoute]);
        let st = new SecurityToken();
        st.role = UserAccountRoles.Administrator;
        expect(sre.preventsUserRole(testRoute.security[0], st)).toBe(true);
    });
    test(`Returns "true" if a security token was provided and we are preventing access to anyone.`, () => {
        testRoute.security.push({
            matchFragment: "/*",
            matchMethods: [],
            preventDataActions: [],
            preventRoles: [AuthStatus.Authenticated, AuthStatus.Anonymous],
            preventLogic: RulePreventLogic.Or
        });       
         
        let sre = new SecurityRuleSelector([testRoute]);
        let st = new SecurityToken();
        st.role = UserAccountRoles.Administrator;
        expect(sre.preventsUserRole(testRoute.security[0], st)).toBe(true);
    });
    test(`Returns "true" if a security token was not provided and we are preventing access to anyone.`, () => {
        testRoute.security.push({
            matchFragment: "/*",
            matchMethods: [],
            preventDataActions: [],
            preventRoles: [AuthStatus.Authenticated, AuthStatus.Anonymous],
            preventLogic: RulePreventLogic.Or
        });       
         
        let sre = new SecurityRuleSelector([testRoute]);
        expect(sre.preventsUserRole(testRoute.security[0], undefined)).toBe(true);
    });
})

describe("SecurityRuleSelector Class - preventsDataAction()", () => {
    
    let testRoute: Route;

    beforeEach(() => {
        process.env.LOGGING_LEVEL = LogLevel.Error //Setting the logging level to "Error"
        //to void having a flood of logging messages during the test.
        //You can comment the line if you wouldlike to see extra details.
        testRoute = new WithoutSecurityRoute();
    })

    test(`Returns "false" if no Body is supplied.`, () => {
        testRoute.security.push({
            matchFragment: "/*",
            matchMethods: [],
            preventDataActions: [DataRequestAction.Save, DataRequestAction.Delete],
            preventRoles: [],
            preventLogic: RulePreventLogic.Or
        });       
         
        let sre = new SecurityRuleSelector([testRoute]);
        expect(sre.preventsDataAction(testRoute.security[0], "")).toBe(false);
    });
    test(`Returns "false" if there is no data actions in the preventDataActions list.`, () => {
        testRoute.security.push({
            matchFragment: "/*",
            matchMethods: [],
            preventDataActions: [],
            preventRoles: [],
            preventLogic: RulePreventLogic.Or
        });       
         
        let sre = new SecurityRuleSelector([testRoute]);
        expect(sre.preventsDataAction(testRoute.security[0], {
            action: "save"
         })).toBe(false);
    });
    test(`Returns "true" if the data action is in the list of data actions to be prevented.`, () => {
        testRoute.security.push({
            matchFragment: "/*",
            matchMethods: [],
            preventDataActions: [DataRequestAction.Save, DataRequestAction.Delete],
            preventRoles: [UserAccountRoles.Administrator],
            preventLogic: RulePreventLogic.Or
        });       
         
        let sre = new SecurityRuleSelector([testRoute]);

        expect(sre.preventsDataAction(testRoute.security[0], {
            action: "save"
        })).toBe(true);
    });
})

describe("SecurityRuleSelector Class - isMatchingFragment()", () => {

    let testRoute: Route;

    beforeEach(() => {
        process.env.LOGGING_LEVEL = LogLevel.Error //Setting the logging level to "Error"
        //to void having a flood of logging messages during the test.
        //You can comment the line if you wouldlike to see extra details.
        testRoute = new WithoutSecurityRoute();
    })

    test(`Returns "true" if both urls match perfectly.`, () => {
        let sre = new SecurityRuleSelector([testRoute]);
        expect(sre.isMatchingFragment("/one/two","/one","/two")).toBe(true);
    });

    test(`Returns "true" if both urls match with slashes variation.`, () => {
        let sre = new SecurityRuleSelector([testRoute]);
        expect(sre.isMatchingFragment("/one/two","/one/","two/")).toBe(true);
    });

    test(`Returns "true" if both urls match without slashes`, () => {
        let sre = new SecurityRuleSelector([testRoute]);
        expect(sre.isMatchingFragment("/one/two","one","two")).toBe(true);
    });

    test(`Returns "true" if request url contains extra parameters`, () => {
        let sre = new SecurityRuleSelector([testRoute]);
        expect(sre.isMatchingFragment("/one/two/2345","/one","/two")).toBe(true);
    });

    test(`Returns "true" if request url contains querystring`, () => {
        let sre = new SecurityRuleSelector([testRoute]);
        expect(sre.isMatchingFragment("/one/two?key=val&key2=val2","/one","/two")).toBe(true);
    });

    test(`Returns "false" if there is no match with extra params`, () => {
        let sre = new SecurityRuleSelector([testRoute]);
        expect(sre.isMatchingFragment("/one/to/1234","/one","/two")).toBe(false);
    });

    test(`Returns "false" if there is no match without extra params`, () => {
        let sre = new SecurityRuleSelector([testRoute]);
        expect(sre.isMatchingFragment("/one/to","/one","/two")).toBe(false);
    });
})

describe("SecurityRuleSelector Class - preventsCustom()", () => {

    let testRoute: Route;

    beforeEach(() => {
        process.env.LOGGING_LEVEL = LogLevel.Error //Setting the logging level to "Error"
        //to void having a flood of logging messages during the test.
        //You can comment the line if you wouldlike to see extra details.
        testRoute = new WithoutSecurityRoute();
    })

    test(`Returns "false" if no custom function is defined.`, () => {
        testRoute.security = [new SecurityRule()];
        let sre = new SecurityRuleSelector([testRoute]);
        let input: SecurityRuleInput = { url: "", method: "", body: ""}
        expect(sre.preventsCustom(testRoute.security[0], input)).toBe(false);
    });

    test(`Returns "false" if the custom function property is null.`, () => {
        testRoute.security = [new SecurityRule()];
        //@ts-ignore
        testRoute.security[0].preventCustom = null;
        let sre = new SecurityRuleSelector([testRoute]);
        let input: SecurityRuleInput = { url: "", method: "", body: ""}
        expect(sre.preventsCustom(testRoute.security[0], input)).toBe(false);
    });

    test(`Returns "false" if the custom function property is not Function type.`, () => {
        testRoute.security = [new SecurityRule()];
        //@ts-ignore
        testRoute.security[0].preventCustom = { attr: 1}; //Anything but a function.
        let sre = new SecurityRuleSelector([testRoute]);
        let input: SecurityRuleInput = { url: "", method: "", body: ""}
        expect(sre.preventsCustom(testRoute.security[0], input)).toBe(false);
    });

    test(`Returns "true" if the custom function property is a function and throws an error.`, () => {
        testRoute.security = [new SecurityRule()];
        testRoute.security[0].preventCustom = (input: SecurityRuleInput): boolean => { 
            throw new Error("Unexpected error!!!")
        }
        let sre = new SecurityRuleSelector([testRoute]);
        let input: SecurityRuleInput = { url: "", method: "", body: ""}
        expect(sre.preventsCustom(testRoute.security[0], input)).toBe(true);
        expect(testRoute.security[0].text).toContain("There was an error during custom function evaluation");
    });

    test(`Returns "false" if the custom function property is a function and evaluates to false.`, () => {
        testRoute.security = [new SecurityRule()];
        testRoute.security[0].preventCustom = (input: SecurityRuleInput): boolean => { 
            return input.url !== ""
        }
        let sre = new SecurityRuleSelector([testRoute]);
        let input: SecurityRuleInput = { url: "", method: "", body: ""}
        expect(sre.preventsCustom(testRoute.security[0], input)).toBe(false);
    });

    test(`Returns "true" if the custom function property is a function and evaluates to true.`, () => {
        testRoute.security = [new SecurityRule()];
        testRoute.security[0].preventCustom = (input: SecurityRuleInput): boolean => { 
            return input.url == "";
        }
        let sre = new SecurityRuleSelector([testRoute]);
        let input: SecurityRuleInput = { url: "", method: "", body: ""}
        expect(sre.preventsCustom(testRoute.security[0], input)).toBe(true);
    });    
})

describe("SecurityRuleSelector Class - isStopRule()", () => {

    let testRoute: Route;
    let input: SecurityRuleInput

    beforeEach(() => {
        process.env.LOGGING_LEVEL = LogLevel.Error //Setting the logging level to "Error"
        //to void having a flood of logging messages during the test.
        //You can comment the line if you wouldlike to see extra details.
        testRoute = new WithoutSecurityRoute();
        let token = new SecurityToken();
        token.userName = "john.doe";
        token.userFullName = "John Doe";
        token.role = UserAccountRoles.User;
        input = { 
            url: "/any", 
            method: "POST", 
            body: { action: "save" }, 
            [REQUEST_TOKEN_KEY]: token 
        }
    })

    //#region No prevents in the rule.

    test(`No preventDataActions, preventRoles or preventCustom with logic OR => No Stops.`, () => {
        testRoute.security.push({
            matchFragment: "/*",
            matchMethods: [],
            preventDataActions: [],
            preventRoles: [],
            preventLogic: RulePreventLogic.Or
        });     
        let sre = new SecurityRuleSelector([testRoute]);
        
        expect(sre.isStopRule(testRoute.security[0], input)).toBe(undefined);
    });
    
    test(`No preventDataActions, preventRoles or preventCustom with logic AND => No Stops.`, () => {
        testRoute.security.push({
            matchFragment: "/*",
            matchMethods: [],
            preventDataActions: [],
            preventRoles: [],
            preventLogic: RulePreventLogic.And
        });     
        let sre = new SecurityRuleSelector([testRoute]);
        
        expect(sre.isStopRule(testRoute.security[0], input)).toBe(undefined);
    });
    //#endregion

    //#region Only one prevent in the rule
    test(`preventDataActions only with logic OR => Stops.`, () => {
        testRoute.security.push({
            matchFragment: "/*",
            matchMethods: [],
            preventDataActions: [DataRequestAction.Save],
            preventRoles: [],
            preventLogic: RulePreventLogic.Or
        });     
        let sre = new SecurityRuleSelector([testRoute]);
        
        expect(sre.isStopRule(testRoute.security[0], input)).not.toBe(undefined);
    });

    test(`preventDataActions only with logic AND => Stops.`, () => {
        testRoute.security.push({
            matchFragment: "/*",
            matchMethods: [],
            preventDataActions: [DataRequestAction.Save],
            preventRoles: [],
            preventLogic: RulePreventLogic.And
        });     
        let sre = new SecurityRuleSelector([testRoute]);
        
        expect(sre.isStopRule(testRoute.security[0], input)).not.toBe(undefined);
    });

    test(`preventRoles only with logic OR => Stops.`, () => {
        testRoute.security.push({
            matchFragment: "/*",
            matchMethods: [],
            preventDataActions: [],
            preventRoles: [UserAccountRoles.User],
            preventLogic: RulePreventLogic.Or
        });     
        let sre = new SecurityRuleSelector([testRoute]);
        
        expect(sre.isStopRule(testRoute.security[0], input)).not.toBe(undefined);
    });

    test(`preventRoles only with logic AND => Stops.`, () => {
        testRoute.security.push({
            matchFragment: "/*",
            matchMethods: [],
            preventDataActions: [],
            preventRoles: [UserAccountRoles.User],
            preventLogic: RulePreventLogic.And
        });     
        let sre = new SecurityRuleSelector([testRoute]);
        
        expect(sre.isStopRule(testRoute.security[0], input)).not.toBe(undefined);
    });

    test(`preventCustom only with logic OR => Stops.`, () => {
        testRoute.security.push({
            matchFragment: "/*",
            matchMethods: [],
            preventDataActions: [],
            preventRoles: [],
            preventCustom: (input: SecurityRuleInput) => {
                return (input.url === "/any")
            },
            preventLogic: RulePreventLogic.Or
        });     
        let sre = new SecurityRuleSelector([testRoute]);
        
        expect(sre.isStopRule(testRoute.security[0], input)).not.toBe(undefined);
    });

    test(`preventCustom only with logic AND => Stops.`, () => {
        testRoute.security.push({
            matchFragment: "/*",
            matchMethods: [],
            preventDataActions: [],
            preventRoles: [],
            preventCustom: (input: SecurityRuleInput) => {
                return (input.url === "/any")
            },
            preventLogic: RulePreventLogic.And
        });     
        let sre = new SecurityRuleSelector([testRoute]);
        
        expect(sre.isStopRule(testRoute.security[0], input)).not.toBe(undefined);
    });
    //#endregion

    //#region Two prevents in the rule

    test(`preventDataActions and preventRoles only one preventing with logic OR => Stops.`, () => {
        testRoute.security.push({
            matchFragment: "/*",
            matchMethods: [],
            preventDataActions: [DataRequestAction.Save],
            preventRoles: [UserAccountRoles.Administrator],
            preventLogic: RulePreventLogic.Or
        });     
        let sre = new SecurityRuleSelector([testRoute]);
        
        expect(sre.isStopRule(testRoute.security[0], input)).not.toBe(undefined);
    });

    test(`preventDataActions and preventCustom only one preventing with logic OR => Stops.`, () => {
        testRoute.security.push({
            matchFragment: "/*",
            matchMethods: [],
            preventDataActions: [DataRequestAction.Find],
            preventRoles: [],
            preventCustom: (input: SecurityRuleInput) => {
                return (input.url === "/any")
            },
            preventLogic: RulePreventLogic.Or
        });     
        let sre = new SecurityRuleSelector([testRoute]);
        
        expect(sre.isStopRule(testRoute.security[0], input)).not.toBe(undefined);
    });

    test(`preventRoles and preventCustom only one preventing with logic OR => Stops.`, () => {
        testRoute.security.push({
            matchFragment: "/*",
            matchMethods: [],
            preventDataActions: [],
            preventRoles: [UserAccountRoles.User],
            preventCustom: (input: SecurityRuleInput) => {
                return false
            },
            preventLogic: RulePreventLogic.Or
        });     
        let sre = new SecurityRuleSelector([testRoute]);
        
        expect(sre.isStopRule(testRoute.security[0], input)).not.toBe(undefined);
    });

    test(`preventDataActions and preventRoles only one preventing with logic AND => No Stops.`, () => {
        testRoute.security.push({
            matchFragment: "/*",
            matchMethods: [],
            preventDataActions: [DataRequestAction.Save],
            preventRoles: [UserAccountRoles.Administrator],
            preventLogic: RulePreventLogic.And
        });     
        let sre = new SecurityRuleSelector([testRoute]);
        
        expect(sre.isStopRule(testRoute.security[0], input)).toBe(undefined);
    });

    test(`preventDataActions and preventCustom only one preventing with logic AND => No Stops.`, () => {
        testRoute.security.push({
            matchFragment: "/*",
            matchMethods: [],
            preventDataActions: [DataRequestAction.Find],
            preventRoles: [],
            preventCustom: (input: SecurityRuleInput) => {
                return (input.url === "/any")
            },
            preventLogic: RulePreventLogic.And
        });     
        let sre = new SecurityRuleSelector([testRoute]);
        
        expect(sre.isStopRule(testRoute.security[0], input)).toBe(undefined);
    });

    test(`preventRoles and preventCustom only one preventing with logic AND => No Stops.`, () => {
        testRoute.security.push({
            matchFragment: "/*",
            matchMethods: [],
            preventDataActions: [],
            preventRoles: [UserAccountRoles.User],
            preventCustom: (input: SecurityRuleInput) => {
                return false
            },
            preventLogic: RulePreventLogic.And
        });     
        let sre = new SecurityRuleSelector([testRoute]);
        
        expect(sre.isStopRule(testRoute.security[0], input)).toBe(undefined);
    });

    //#endregion

    //#region Three prevents in the rule

    test(`3 prevents only 1 preventing with logic OR => Stops.`, () => {
        testRoute.security.push({
            matchFragment: "/*",
            matchMethods: [],
            preventDataActions: [DataRequestAction.Save],
            preventRoles: [UserAccountRoles.Administrator],
            preventCustom: (input: SecurityRuleInput) => {
                return false //(input.url === "/any")
            },
            preventLogic: RulePreventLogic.Or
        });     
        let sre = new SecurityRuleSelector([testRoute]);
        
        expect(sre.isStopRule(testRoute.security[0], input)).not.toBe(undefined);
    });

    test(`3 prevents only 2 preventing with logic OR => Stops.`, () => {
        testRoute.security.push({
            matchFragment: "/*",
            matchMethods: [],
            preventDataActions: [DataRequestAction.Save],
            preventRoles: [UserAccountRoles.User],
            preventCustom: (input: SecurityRuleInput) => {
                return false //(input.url === "/any")
            },
            preventLogic: RulePreventLogic.Or
        });     
        let sre = new SecurityRuleSelector([testRoute]);
        
        expect(sre.isStopRule(testRoute.security[0], input)).not.toBe(undefined);
    });

    test(`3 prevents the 3 preventing with logic OR => Stops.`, () => {
        testRoute.security.push({
            matchFragment: "/*",
            matchMethods: [],
            preventDataActions: [DataRequestAction.Save],
            preventRoles: [UserAccountRoles.User],
            preventCustom: (input: SecurityRuleInput) => {
                return (input.url === "/any")
            },
            preventLogic: RulePreventLogic.Or
        });     
        let sre = new SecurityRuleSelector([testRoute]);
        
        expect(sre.isStopRule(testRoute.security[0], input)).not.toBe(undefined);
    });

    test(`3 prevents only 1 preventing with logic AND => No Stops.`, () => {
        testRoute.security.push({
            matchFragment: "/*",
            matchMethods: [],
            preventDataActions: [DataRequestAction.Save],
            preventRoles: [UserAccountRoles.Administrator],
            preventCustom: (input: SecurityRuleInput) => {
                return false 
            },
            preventLogic: RulePreventLogic.And
        });     
        let sre = new SecurityRuleSelector([testRoute]);
        
        expect(sre.isStopRule(testRoute.security[0], input)).toBe(undefined);
    });

    test(`3 prevents only 2 preventing with logic AND => No Stops.`, () => {
        testRoute.security.push({
            matchFragment: "/*",
            matchMethods: [],
            preventDataActions: [DataRequestAction.Save],
            preventRoles: [UserAccountRoles.User],
            preventCustom: (input: SecurityRuleInput) => {
                return false
            },
            preventLogic: RulePreventLogic.And
        });     
        let sre = new SecurityRuleSelector([testRoute]);
        
        expect(sre.isStopRule(testRoute.security[0], input)).toBe(undefined);
    });

    test(`3 prevents the 3 preventing with logic AND => Stops.`, () => {
        testRoute.security.push({
            matchFragment: "/*",
            matchMethods: [],
            preventDataActions: [DataRequestAction.Save],
            preventRoles: [UserAccountRoles.User],
            preventCustom: (input: SecurityRuleInput) => {
                return (input.url === "/any")
            },
            preventLogic: RulePreventLogic.And
        });     
        let sre = new SecurityRuleSelector([testRoute]);
        
        expect(sre.isStopRule(testRoute.security[0], input)).not.toBe(undefined);
    });  
    
    //#endregion
})