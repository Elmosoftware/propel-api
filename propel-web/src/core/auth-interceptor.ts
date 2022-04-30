import { Injectable } from "@angular/core";
import { HttpEvent, HttpRequest, HttpHandler, HttpInterceptor } from "@angular/common/http";
import { Observable } from "rxjs";
import { SessionService } from "src/services/session.service";
import { BEARER_PREFIX } from "../../../propel-shared/core/security-token";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(private session: SessionService) {

    }

    /**
     * This interceptor is intended to include automatically the Authorization header with the 
     * access token if there is any user logged in.
     * @param req Request
     * @param next Next Handler
     * @returns An observable of the HTTP Event.
     */
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        
        if (this.session.IsUserLoggedIn) {
            req = req.clone({ 
                setHeaders: {
                    Authorization: `${BEARER_PREFIX}${this.session.sessionData.accessToken}`
                }})
        }
        
        return next.handle(req)
    }
}