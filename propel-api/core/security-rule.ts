import { DataRequestAction } from "../../propel-shared/core/data-request";
import { UserAccountRoles } from "../../propel-shared/models/user-account-roles";
import { HTTPMethods } from "./http-methods";

/**
 * Users Authentication status.
 */
export enum AuthStatus {
    Anonymous = "Anonymous",
    Authenticated = "Authenticated"
}

/**
 * Logic to use to evaluate the rule.
 */
export enum RulePreventLogic {
    Or = 0,
    And = 1
}

/**
 * A security rule prevent the access to a defined endpoint when some conditions are met.
 * 
 * **IMPORTANT: A security rule is meant to STOP an action, not to allow it.** So a list of
 * Security rules are acting as a black list.
 * 
 * You can define the following attributes:
 *  - **fragment**: Is a specific function in a route. So, if you have a route with path *"/users"* and 
 * you would like to add a rule for the users "create" function you can add a rule for the fragment *"/create"*.
 * Also, you can use a wildcard fragment *"/*"* or simply *"*"* to detail that this rule applies to any function 
 * in the route.
 *  - **methods**: Is the HTTP method the rule applies. If no methods were added to the list, means the rule 
 * applies to any method. 
 *  - **preventDataActions**: A set of data actions that need to be prevented. (Applies only to 
 * the *"/api/data"* route). Not having actions in this list, means any actions are allowed.
 *  - **preventRoles**: A set of User roles or user authentication status that need to 
 * be prevented. 
 * - **preventLogic**: Indicates the way **preventDataActions** and **preventRoles** should be 
 * evaluated. 
 */
export class SecurityRule {

    /**
     * This is the route fragment that we need to match.
     * @example
     * //Lets supose we apply this rule to a route with path "/users" if we define the fragment as:
     * rule = new SecurityRule()
     * rule.fragment = "/add"
     * //This will match the route "/user/add"
     */
    matchFragment: string = "/*";

    /**
     * Allows to specify the HTTP methods that you would like to match for this rule.
     * If no HTTP methods are specified, means this rule applies to any HTTP method. 
     */
    matchMethods: HTTPMethods[] = []

    /**
     * Allows to specify the data actions that you would like to match for this rule.
     * If no data actions are specified, means no data action (find, save, delete, etc..) 
     * will be prevented.
     */
    preventDataActions: DataRequestAction[] = []

    /**
     * The User roles that will have forbidden access to the resource or the 
     * authentication status of the user.
     * If no roles/status are specified, means no user role, (even anonymous users that for 
     * definition has no roles), will be prevented.
     */
    preventRoles: (UserAccountRoles | AuthStatus)[] = []

    /**
     * A custom logic that will be evaluated. This is a function that will have as argument a 
     * SecurityRuleInput object and will return a boolean value indicating in the action 
     * must be prevented.
     * @example
     * myrule = new SecurityRule()
     * myRule.preventCustom = (input: SecurityRuleInput): boolean => { 
     *  return (input.body?.myField == "Forbidden value");
     * }
     * //For that rule if the body of the request is JSON and have a field named "myField" with the value
     * //"Forbidden value" the rule will prevent the action.
     */
    preventCustom?: Function;

    /**
     * The logictouse to prevent the actions. Default Logic is "Or", this means that if 
     * *preventDataActions* or *preventRoles* is a positive match, the action will be prevented.
     * If the logic is "And", both must be a positive match in order to prevent the action. 
     */
    preventLogic: RulePreventLogic = RulePreventLogic.Or;

    /**
     * Optional HTTP status to return if the rule stops a request invocation.
     */
    HTTPStatus?: number;

    /**
     * Any sort of description you would like to add to the security rule.
     */
    text?: string = "";

    constructor() {

    }
}