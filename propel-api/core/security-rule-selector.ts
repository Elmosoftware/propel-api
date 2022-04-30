import { FORBIDDEN, UNAUTHORIZED } from "http-status-codes";
import { PropelError } from "../../propel-shared/core/propel-error";
import { SecurityToken } from "../../propel-shared/core/security-token";
import { AuthStatus, RulePreventLogic, SecurityRule } from "./security-rule";
import { REQUEST_TOKEN_KEY } from "./middleware";
import { Route } from "./route";
import { Utils } from "../../propel-shared/utils/utils";
import { UserAccountRoles } from "../../propel-shared/models/user-account-roles";

/**
 * This call evaluates a SecurityRule facilitating to resolve if the request invocation must 
 * be prevented or not.
 */
export class SecurityRuleSelector {

    private _allRoutes: Route[];

    /**
     * For the provided request, this method will return the first found rule that prevents the actions from 
     * the set of security rules defined for the specific rute that match the provided request url.
     * @param request Request to evaluate.
     * @returns The first rule that prevents the request invocation.
     */
    select(request: { url: string, method: string, body: any, [REQUEST_TOKEN_KEY]?: SecurityToken }): SecurityRule | undefined {

        let ret: SecurityRule | undefined = undefined;

        this._allRoutes.forEach((route: Route) => {
            if (!ret && request.url.startsWith(route.path)) {
                //Need then to look for a specific security rule:
                if (route.security) {
                    route.security.forEach((rule: SecurityRule) => {
                        //If we already find a rule that prevents the actions, there is 
                        //no point to continue:
                        if (ret) return;

                        //If the rule is a default one or it match the request url and also 
                        //the HTTPMethod:
                        if (this.isMatchingFragment(request.url, route.path, rule.matchFragment)
                            && this.matchMethod(rule, request.method)) {
                            ret = this.isStopRule(rule, request.body, request[REQUEST_TOKEN_KEY]);
                        }
                    })
                }
            }
        })

        return ret;
    }

    /**
     * Based on the user HTTP method supplied, a boolean value will 
     * be returned indicating if the request execution will be prevented.
     * @param method HTTP method.
     * @returns A boolean value indicating if the request invocation must be prevented.
     */
    matchMethod(rule: SecurityRule, method: string): boolean {

        if (!method) throw new PropelError(`We expect a HTTP method in the parameter ""method"".`);

        //If the rule has no HTTP methods defined, means it apply to any HTTP method:
        if (!rule.matchMethods || !Array.isArray(rule.matchMethods) ||
            rule.matchMethods.length == 0) return true;

        return Boolean(rule.matchMethods.find((ruleMethod) => {
            return String(ruleMethod).toLowerCase() == String(method).toLowerCase();
        }));
    }

    /**
     * A default rule is specified using the value "/*" or simply "*" in the "fragment" attribute.
     * @returns A boolean value indicating if the rule is a default rule.
     */
    isDefaultRule(ruleFragment: string): boolean {
        return ruleFragment == "/*" || ruleFragment == "*";
    }

    /**
     * Returns aboolean value that indicates id the request URL match the route and fragment URLs provided.
     * @example
     * isMatchingFragment("/api/user", "/api/categories", "/grouped") -> false
     * isMatchingFragment("/api/categories/locations", "/api/categories", "/grouped") -> false
     * isMatchingFragment("/api/categories/locations", "/api/categories", "/*") -> true //A default rule.
     * isMatchingFragment("/api/categories/locations", "/api/categories", "/locations") -> true
     * isMatchingFragment("/api/categories/locations/23", "/api/categories", "/locations") -> true //extra parameters are ok.
     * isMatchingFragment("/api/categories/locations?key=value", "/api/categories", "/locations") -> true //Querystring params are ok too.
     * @param requestURL The request URL.
     * @param routePath The path of the route we are evaluating for a match.
     * @param ruleFragment The fragment of the route we are evaueating for a match.
     * @returns If the request URL is matching the rule and fragment provided.
     */
    isMatchingFragment(requestURL: string, routePath: string, ruleFragment: string): boolean {
        let ruleURL: string;

        if (!requestURL) return false;
        if (this.isDefaultRule(ruleFragment)) return true;

        requestURL = Utils.getURLPath(requestURL.toLowerCase());
        ruleURL = Utils.joinURLPath(routePath.toLowerCase(), ruleFragment.toLowerCase())

        if (ruleURL.length > requestURL.length) return false; //Not a match if the rule path is longer.
        return requestURL.slice(0, ruleURL.length) == ruleURL;
    }

    /**
     * Based on the DataRequestAction in the request body, this method will return a 
     * boolean value indicating if the request execution will be prevented.
     * @param rule: Rule to evaluate
     * @param requestBody Request body
     * @returns A boolean value indicating if the request invocation must be prevented.
     */
    preventsDataAction(rule: SecurityRule, requestBody: any): boolean {
        //If no body provided, no data action to be prevented:
        if (!requestBody?.action) return false;

        //If no data actions in the rule, nothing to be prevented: 
        if (!rule.preventDataActions || !Array.isArray(rule.preventDataActions) ||
            rule.preventDataActions.length == 0) return false

        //If the data action is on the list of data actions in the rule, we must prevent the invocation:
        return Boolean(rule.preventDataActions.find((preventedDataAction) => {
            return String(preventedDataAction).toLowerCase() == String(requestBody?.action).toLowerCase();
        }));
    }

    /**
     * Based on the user role supplied or his status, this method will return a 
     * boolean value indicating if the request execution must be prevented.
     * @param rule: Rule to evaluate
     * @param secToken Security token provided in the request.
     * @returns A boolean value indicating if the request invocation must be prevented.
     */
    preventsUserRole(rule: SecurityRule, secToken?: SecurityToken): boolean {

        if (!rule.preventRoles || !Array.isArray(rule.preventRoles) ||
            rule.preventRoles.length == 0) return false;

        return Boolean(rule.preventRoles.find((role: (UserAccountRoles | AuthStatus)) => {
            return (role == AuthStatus.Anonymous && !secToken) ||
                (role == AuthStatus.Authenticated && secToken) ||
                (secToken && String(secToken.role).toLowerCase() == String(role).toLowerCase());
        }));
    }

    /**
     * Analize the rule with the providing data and return an undefined value if the rule is not
     * preventingthe action.
     * If the rule is preventing the action, the same rule will be returned, but with added 
     * information in the *"text"* property explaining why this is a stop rule.
     * @param rule Rule to evaluate
     * @param body Request body, (used for DataRequestAction evaluation, sofar used by the Data API only).
     * @param token SecurityToken if any.
     * @returns The same rule with added description of why the action must be stopped.
     */
    isStopRule(rule: SecurityRule, body: any, token?: SecurityToken): SecurityRule | undefined {

        let preventCount: number = 0;
        let retRule: SecurityRule | undefined;

        if (this.preventsDataAction(rule, body)) {
            preventCount++;
            retRule = Object.assign({}, rule);
            retRule.HTTPStatus = (retRule.HTTPStatus) ? retRule.HTTPStatus : FORBIDDEN;
            retRule.text = ` Rule description: ${retRule.text}
Rule evaluation outcome: This rule prevents a specific data action. The data action "${body?.action}" provided in the request is forbidden by this rule.`
        }

        if (this.preventsUserRole(rule, token)) {
            preventCount++;

            if (!retRule) {
                retRule = Object.assign({}, rule);
                retRule.text = ` Rule description: ${retRule.text}`
            }

            retRule.HTTPStatus = (retRule.HTTPStatus) ? retRule.HTTPStatus : UNAUTHORIZED;
            retRule.text += `\r\nRule evaluation outcome: This rule prevent specific user roles.
The access for user "${(token?.userName) ? token?.userName : "unknown user" }""${(token?.role) ? " with role \"" + token?.role.toString() + "\"" : " "}is forbidden because of this rule.`
        }

        //Not enough to prevent the action:
        if (preventCount == 1 && rule.preventLogic == RulePreventLogic.And) {
            retRule = undefined;
        }

        if (retRule) {
            retRule.text += `\r\nThe rule logic requires ${(rule.preventLogic == RulePreventLogic.And) ? "both" : "at least one"} of the cases to be positive to prevent the action.
Security rule details:` +
                `fragment: "${retRule.matchFragment}", ` +
                `matchMethods: [${retRule.matchMethods.join(",")}], ` +
                `preventDataActions: [${retRule.preventDataActions.join(",")}], ` +
                `preventRoles: [${retRule.preventRoles.join(",")}], ` +
                `preventLogic: ${(rule.preventLogic == RulePreventLogic.And) ? "AND" : "OR"}, ` +
                `HTTPStatus: ${(retRule.HTTPStatus) ? String(retRule.HTTPStatus) : "None"}`
        }

        return retRule;
    }

    constructor(routes: Route[]) {
        if (!routes) throw new PropelError(`We expect a collection of Routes with all his security rules to evaluate in the constructor. Parameter ""rule"".`);

        this._allRoutes = routes;
    }
}