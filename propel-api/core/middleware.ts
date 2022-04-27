import { BAD_REQUEST, UNAUTHORIZED } from "http-status-codes";
import { APIResponse } from "../../propel-shared/core/api-response";
import { PropelError } from "../../propel-shared/core/propel-error";
import { SecurityService } from "../services/security-service";
import { SecurityRule } from "./security-rule";

export const REQUEST_TOKEN_KEY = "PropelTokenPayload"

export class Middleware {

     /**
     * Express.JS Authorization middleware.
     * Any request will be processed by this method. If the request contains an authorization header,
     * the token will be verified, decoded and stored in the request with the key REQUEST_TOKEN_KEY.
     * @param req Express.Request
     * @param res Express.Response
     * @param next Next function in the middleware chain.
     */
      static auth(security:SecurityService) {
        return (req: any, res: any, next: Function) => {

            let authHeader: string = req.headers["authorization"];
            let authPrefix: string = "Bearer "
            let accessToken: string = "";
            let rule: SecurityRule | undefined;
    
            try {
    
                if (authHeader && authHeader.startsWith(authPrefix)) {
                    accessToken = authHeader.slice(authPrefix.length);
    
                    if (!accessToken) {
                        throw new PropelError(`No Token data provided. the token was a Bearer token, but we ` +
                            `found no data after the word "Bearer". Please check the data sent in ` + 
                            `the "authorization" header.`, undefined, BAD_REQUEST.toString());
                    }
    
                    req[REQUEST_TOKEN_KEY] = security.verifyToken(accessToken);
                }
    
                rule = security.ruler.select(req);

                //If there is a security rule that is preventing this invocation: 
                if (rule) {
                    throw new PropelError(`The invocation was prevented by a security rule.`+ 
                        `${(rule.text) ? rule.text : "No additional information available."}`,
                        undefined, (rule.HTTPStatus) ? rule.HTTPStatus.toString() : UNAUTHORIZED.toString())
                }
    
            } catch (error) {
                let httpStatus: number = Number((error as PropelError).httpStatus) | UNAUTHORIZED;
                return res.status(httpStatus).json(new APIResponse<any>(error, null));
            }
    
            next();
        }
    }
}