import { Injectable } from "@angular/core";
import { HttpEvent, HttpRequest, HttpHandler, HttpInterceptor } from "@angular/common/http";
import { Observable, throwError, BehaviorSubject, from } from "rxjs";
import { catchError, filter, switchMap, take, tap } from "rxjs/operators";
import { BEARER_PREFIX } from "../../../propel-shared/core/security-token";
import { PropelError } from "../../../propel-shared/core/propel-error";
import { ErrorCodes } from "../../../propel-shared/core/error-codes";
import { SecurityService } from "src/services/security.service";
import { NavigationService } from "src/services/navigation.service";
import { UserLoginResponse } from "../../../propel-shared/core/user-login-response";
import { TokenRefreshRequest } from "../../../propel-shared/core/token-refresh-request";
import { logger } from "../../../propel-shared/services/logger-service";

/**
 * This header indicates that no Authorization data is needed to be sent for the request.
 */
export const X_HEADER_NOAUTH = "x-propel-noauth"

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    private _isRefreshing: boolean;
    private _refreshTokenSubject: BehaviorSubject<UserLoginResponse>

    constructor(private security: SecurityService, private nav: NavigationService) {
        this._isRefreshing = false;
        this._refreshTokenSubject = new BehaviorSubject<UserLoginResponse>(null);
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
            req = this.removeHeader(req, X_HEADER_NOAUTH);
        }
        else {
            req = this.addAuthorizationHeader(req)
        }

        return next.handle(req)
            .pipe(
                catchError((e) => {
                    let error: PropelError = new PropelError(e);

                    if (error.errorCode?.key == ErrorCodes.TokenIsExpired.key) {
                        logger.logWarn(`Receiving a ${error.errorCode.key} from URL request "${req.url}"`)
                        return this.handleTokenExpiredError(req, next);
                    }

                    return throwError(error)
                })
            )
    }

    private handleTokenExpiredError(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (this._isRefreshing) {
            logger.logInfo(`Refresh is in progress, queuing incoming request to "${req.url}".`)
            return this._refreshTokenSubject
                .pipe(
                    filter(response => response !== null),
                    take(1),
                    switchMap((response: UserLoginResponse) => {
                        req = this.addAuthorizationHeader(req)
                        return next.handle(req)
                    })
                )
        }
        else {
            this._isRefreshing = true;
            this._refreshTokenSubject.next(null);
            logger.logInfo(`Starting Access token refresh process...`)
            return from(this.security.refreshAccessToken(new TokenRefreshRequest(this.security.refreshToken)))
                .pipe(
                    catchError((err) => {
                        this._refreshTokenSubject.complete()
                        this._refreshTokenSubject = new BehaviorSubject<UserLoginResponse>(null);
                        this._isRefreshing = false;
                        this.nav.toHome(true);
                        return throwError(err)
                    }),
                    switchMap((response: UserLoginResponse) => {
                        this._isRefreshing = false;
                        req = this.addAuthorizationHeader(req)
                        this._refreshTokenSubject.next(response)
                        return next.handle(req);
                    })
                )
        }
    }

    private addAuthorizationHeader(req: HttpRequest<any>): HttpRequest<any> {
        if (!this.security.isUserLoggedIn) return req;
        let auth: string = `${BEARER_PREFIX}${this.security.sessionData.accessToken}`

        return req.clone({ headers: req.headers.set('Authorization', auth) });
    }

    private removeHeader(req: HttpRequest<any>, headerName: string): HttpRequest<any> {
        if (!req.headers.has(headerName)) return req;

        return req.clone({
            headers: req.headers.delete(headerName)
        });
    }
}