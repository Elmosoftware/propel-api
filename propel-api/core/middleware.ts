import { BAD_REQUEST, UNAUTHORIZED } from "http-status-codes";
import { WebsocketMessage } from "../../propel-shared/core/websocket-message";
import { PropelError } from "../../propel-shared/core/propel-error";
import { BEARER_PREFIX, ACCESS_TOKEN_QUERYSTRING_KEY } from "../../propel-shared/core/security-token";
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
            let accessToken: string = "";
            let rule: SecurityRule | undefined;
    
            try {

                //Websockets protocol doesn't allow to send headers, so for that special case the 
                //access token issent via query strings.
                if (!authHeader && req.query[ACCESS_TOKEN_QUERYSTRING_KEY]) {
                    authHeader = req.query[ACCESS_TOKEN_QUERYSTRING_KEY];
                }
    
                if (authHeader && authHeader.startsWith(BEARER_PREFIX)) {
                    accessToken = authHeader.slice(BEARER_PREFIX.length);
    
                    if (!accessToken) {
                        throw new PropelError(`No Token data provided. the token was a Bearer token, but we ` +
                            `found no data after the word "Bearer". Please check the data sent in ` + 
                            `the "authorization" header.`, undefined, BAD_REQUEST.toString());
                    }
    
                    req[REQUEST_TOKEN_KEY] = security.verifyToken(accessToken);
                }
    
                //Checking if there is any security rule preventing this request:
                rule = security.ruler.select(req);

                if (rule) {
                    throw new PropelError(`The invocation was prevented by a security rule.`+ 
                        `${(rule.text) ? rule.text : "No additional information available."}`,
                        undefined, (rule.HTTPStatus) ? rule.HTTPStatus.toString() : UNAUTHORIZED.toString())
                }
    
            } catch (error) {
                let e: PropelError = (error as PropelError)

                //If is a websockets connection:
                if (req.ws) {
                    let msg = new WebsocketMessage<PropelError>("Error", 
                        (e.userMessage) ? e.userMessage : "Unexpected communication error. Please retry later.", e, "middleware")
                    req.ws.send(JSON.stringify(msg))
                    req.ws.close();
                    return;
                }
                else {
                    return res.status(Number(e.httpStatus) || UNAUTHORIZED)
                        .json(e);
                }
            }
    
            next();
        }
    }
}