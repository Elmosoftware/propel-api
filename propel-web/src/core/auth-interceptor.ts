import { Injectable } from "@angular/core";
import { HttpEvent, HttpRequest, HttpHandler, HttpInterceptor } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { BEARER_PREFIX } from "../../../propel-shared/core/security-token";
import { catchError } from "rxjs/operators";
import { PropelError } from "../../../propel-shared/core/propel-error";
import { ErrorCodes } from "../../../propel-shared/core/error-codes";
import { SecurityService } from "src/services/security.service";
import { NavigationService } from "src/services/navigation.service";

/**
 * This header indicates that no Authorization data is needed to be sent for the request.
 */
export const X_HEADER_NOAUTH = "x-propel-noauth"

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(private security: SecurityService, private nav: NavigationService) {

    }
    /**
     * This interceptor is intended to include automatically the Authorization header with the 
     * access token if there is any user logged in.
     * @param req Request
     * @param next Next Handler
     * @returns An observable of the HTTP Event.
     */
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        //If the No Auth header is present, means no authorization header need to be included
        if (req.headers.has(X_HEADER_NOAUTH)) {
            req = req.clone({
                headers: req.headers.delete(X_HEADER_NOAUTH)
            });
        }
        else if (this.security.isUserLoggedIn) {
            req = req.clone({ 
                setHeaders: {
                    Authorization: `${BEARER_PREFIX}${this.security.sessionData.accessToken}`
                }})
        }

        return next.handle(req)
        .pipe(
            catchError((e) => {
                let error: PropelError = new PropelError(e);

                if (error.errorCode?.key == ErrorCodes.TokenIsExpired.key) {
                    this.security.logOff();
                    this.nav.toHome();
                }

                return throwError(error)
            })
        )
    }
}