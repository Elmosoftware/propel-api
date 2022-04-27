import { DataRequestAction } from "../../propel-shared/core/data-request";
import { UserAccountRoles } from "../../propel-shared/models/user-account-roles";
import { HTTPMethods } from "./http-methods";

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
 *  - **preventRoles**: A set of User roles that need to be prevented. Not having roles in this list, means any 
 * user roles are allowed.
 * So, let's take a look at the following example:
 * @example
 * /*
 * Suppose to have for the route with path *"/storage"* The following security rules:
 * * /
 * [
 *  {
 *      fragment: "/*",
 *      methods: ["GET"],
 *      preventDataActions: [DataRequestAction.Delete],
 *      preventRoles: []
 *  },
 *  {
 *      fragment: "/resize",
 *      methods: [],
 *      preventDataActions: [],
 *      preventRoles: [UserAccountRoles.User]
 *  }
 * ]
 * @description 
 * Here we have a wildcard fragment "/*" that will prevent the access to any function if is using a 
 * *"GET"* HTTP method and in the body of the request includes the DataRequestAction *"Delete"*.
 * We have also a second rule, preventing the access to users with the role *"User"* to the *"/resize"*
 * function by any HTTP method.
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
     * If no data actions are specified, means any data action (find, save, delete, etc..) is 
     * allowed by this rule.
     */
    preventDataActions: DataRequestAction[] = []

    /**
     * The User roles that will have forbidden access to the resource.
     * If no roles are specified, means any user role, (even anonymous users that for 
     * definition has no roles), will be allowed.
     */
    preventRoles: UserAccountRoles[] = []

    /**
     * Indicate if anonymous access must be prevented. 
     * By default this value is "true", which means if there is no authentication token 
     * the invocation will return a 401 HTTP status.
     * A "false" value means an "authorization" header will not be required.
     */
    preventAnon: boolean = true;

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