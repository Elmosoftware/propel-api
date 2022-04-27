import { HTTPMethods } from "../../core/http-methods";
import { SecurityRuleSelector } from "../../core/security-rule-selector";
import { UserAccountRoles } from "../../../propel-shared/models/user-account-roles";
import { DataRequestAction } from "../../../propel-shared/core/data-request";
import { Route } from "../../core/route";
import { SecurityRule } from "../../core/security-rule";
import express, { Router } from "express";
import { LogLevel } from "../../core/config";

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
                preventAnon: true
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
            preventAnon: true
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
            preventAnon: true
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
            preventAnon: true
        });       

        let sre = new SecurityRuleSelector([testRoute]);

        expect(sre.matchMethod(testRoute.security[0], HTTPMethods.Patch)).toBe(false);
    });
})

describe("SecurityRuleSelector Class - rulePreventsUserRole()", () => {

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
            preventAnon: true
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
            preventAnon: true
        });       
         
        let sre = new SecurityRuleSelector([testRoute]);
        expect(sre.preventsUserRole(testRoute.security[0], UserAccountRoles.Administrator)).toBe(false);
    });
    test(`Returns "false" if the user role is not in the prevent roles list.`, () => {
        testRoute.security.push({
            matchFragment: "/*",
            matchMethods: [],
            preventDataActions: [],
            preventRoles: [UserAccountRoles.User],
            preventAnon: true
        });       
         
        let sre = new SecurityRuleSelector([testRoute]);
        expect(sre.preventsUserRole(testRoute.security[0], UserAccountRoles.Administrator)).toBe(false);
    });
    test(`Returns "true" if the user role is in the prevent roles list.`, () => {
        testRoute.security.push({
            matchFragment: "/*",
            matchMethods: [],
            preventDataActions: [],
            preventRoles: [UserAccountRoles.Administrator],
            preventAnon: true
        });       
         
        let sre = new SecurityRuleSelector([testRoute]);
        expect(sre.preventsUserRole(testRoute.security[0], UserAccountRoles.Administrator)).toBe(true);
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
            preventAnon: true
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
            preventAnon: true
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
            preventAnon: true
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