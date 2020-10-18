import { Injectable, OnDestroy, EventEmitter } from '@angular/core';
import { of, fromEvent } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { PropelAppError } from "../core/propel-app-error";
import { APIStatusService } from './api-status.service';
import { logger } from '../../../propel-shared/services/logger-service';
import { APIResponse } from '../../../propel-shared/core/api-response';

/**
 * Provides connectivity awareness.
 */
@Injectable({
    providedIn: 'root'
})
export class ConnectivityService implements OnDestroy {

    /**
     * Returns a ConnectivityStatus object that represents the current connectivity status for 
     * the client side application.
     */
    status: ConnectivityStatus;

    /**
     * Fires when there is a connectivity status change on client side.
     */
    private onConnectivityStatusChange: EventEmitter<ConnectivityStatus> = new EventEmitter();

    private statusNetOfflineSubscription$; //Subscription for the window.offline event.
    private statusNetOnlineSubscription$; //Subscription for the window.online event.
    private statusAPISubscription$; //Subscription for accessing the API.

    constructor(private svc: APIStatusService) {
        logger.logInfo("ConnectivityService instance created")
        this.status = new ConnectivityStatus();
        this.initialize();
    }

    getConnectivityStatusChangeSubscription(): EventEmitter<ConnectivityStatus> {
        return this.onConnectivityStatusChange;
    }

    private initialize() {

        this.statusNetOnlineSubscription$ = fromEvent(window, "online");
        this.statusNetOfflineSubscription$ = fromEvent(window, "offline");

        this.statusNetOnlineSubscription$.subscribe(() => {
            logger.logInfo("window.online event has been fired.");
            this.updateStatus();
        });

        this.statusNetOfflineSubscription$.subscribe(() => {
            logger.logWarn("window.OFFLINE event has been fired.");
            this.updateStatus();
        });

        this.updateStatus();
    }

    /**
     * 
     * @param lastError Optionally, an Error object containing the unhandled exception details that 
     * is causing this request to update connectivity status.
     * If an error is passed as parameter, the SubscriptionService ConnectivityStatusChange event will be fired.
     * If no error is passes as parameter, the event will be fired ONLY if there is a status change.
     */
    updateStatus(lastError?: PropelAppError): void {

        this.statusAPISubscription$ =
            this.svc.getStatus()
                .pipe(
                    catchError((err) => {
                        return of({ error: err });
                    }),
                    map((data: any) => {
                        return this.mapResponse(data, "API", lastError)
                    })
                );

        this.statusAPISubscription$
            .subscribe((data: APIResponse<any>) => {
                let newStatus: ConnectivityStatus = this.evaluate(data);

                //We will fire the event only if there is a connectivity status change or there was an 
                //error that is requiring to check the connectivity status for proper logging:
                if (this.isStatusChanged(newStatus) || newStatus.lastError) {
                    this.status = Object.assign({}, newStatus);
                    this.onConnectivityStatusChange.emit(newStatus);
                }
            },
                err => {
                    throw err
                });
    }

    private mapResponse(data: any, endpointType: string, lastError?: PropelAppError) {

        let ret = {
            error: null,
            url: endpointType,
            lastError: lastError
        }

        if (data && data.error) {
            ret.error = data.error;
        }

        return ret;
    }

    private evaluate(data: any): ConnectivityStatus {

        let s: ConnectivityStatus = new ConnectivityStatus();

        if (data.url == "API") {
            s.apiOn = !Boolean(data.error);
        }

        if (data.lastError) {
            s.lastError = data.lastError;
        }

        return s;
    }

    private isStatusChanged(newStatus: ConnectivityStatus): boolean {
        return (this.status.apiOn != newStatus.apiOn || this.status.networkOn != newStatus.networkOn);
    }

    ngOnDestroy(): void {
        try {
            this.statusNetOfflineSubscription$.unsubscribe();
            this.statusNetOnlineSubscription$.unsubscribe();
            this.statusAPISubscription$.unsubscribe();
        }
        catch (e) {
        }
    }
}

/**
 * Provide all teh required information about the current client side app connectivity status.
 */
export class ConnectivityStatus {
    /**
     * 
     * @param networkOn Boolean value indicating if the user has network connectivity. By default the browser connectivity indicator will be used.
     * @param apiOn Boolean value that indicates if the API is up and running.
     * @param lastError ErrorLog objectthat contains the information for the last error sent to this service.
     */
    constructor(networkOn: boolean = window.navigator.onLine, apiOn: boolean = false,
        lastError: PropelAppError = null) {
        this.networkOn = networkOn;
        this.apiOn = apiOn;
        this.lastError = lastError;
    }

    /**
     * Boolean value indicating if the user has network connectivity.
     */
    networkOn: boolean;

    /**
     * Boolean value that indicates if the API is up and running.
     */
    apiOn: boolean;

    /**
     * Last error sent to this service.
     */
    lastError: PropelAppError;

    // /**
    //  * Indicates if the user has connectivity issues.
    //  */
    // get isNetworkOffline(): boolean {
    //     return !this.networkOn;
    // }

    // /**
    //  * Indicates if the API must report to be offline.
    //  */
    // get isAPIUnreachable(): boolean {
    //     return !this.isNetworkOffline && !this.apiOn;
    // }

    // /**
    //  * Indicate if 2 main params are ok, this means:
    //  *  - The user has network connectivity.
    //  *  - The user has access to the API.
    //  */
    // get isOnline(): boolean {
    //     return !this.isNetworkOffline && !this.isAPIUnreachable;
    // }
}