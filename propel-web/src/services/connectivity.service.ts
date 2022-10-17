import { Injectable, OnDestroy, EventEmitter } from '@angular/core';
import { fromEvent, Observable, Subscription } from 'rxjs';

import { PropelError } from "../../../propel-shared/core/propel-error";
import { APIStatusService } from './api-status.service';
import { logger } from '../../../propel-shared/services/logger-service';

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

    private statusNetOfflineSubscription$?: Subscription; //Subscription for the window.offline event.
    private statusNetOnlineSubscription$?: Subscription; //Subscription for the window.online event.

    constructor(private svc: APIStatusService) {
        logger.logInfo("ConnectivityService instance created")
        this.status = new ConnectivityStatus();
        this.initialize();
    }

    /**
     * Subscribe to the Connectivity status change event.
     * @returns EventEmitter instance.
     */
    getConnectivityStatusChangeSubscription(): EventEmitter<ConnectivityStatus> {
        return this.onConnectivityStatusChange;
    }

    ngOnDestroy(): void {
        try {
            if (this.statusNetOnlineSubscription$) {
                this.statusNetOnlineSubscription$.unsubscribe();
            }
            
            if (this.statusNetOfflineSubscription$) {
                this.statusNetOfflineSubscription$.unsubscribe();
            }
        }
        catch (e) {
        }
    }

    /**
     * Verify the connectivity status of the app and update it accordingly.
     * @param lastError Optionally, an Error object containing the unhandled exception details that 
     * is causing this request to update connectivity status.
     * If an error is passed as parameter, the SubscriptionService ConnectivityStatusChange event will be fired.
     * If no error is passes as parameter, the event will be fired ONLY if there is a status change.
     */
    async updateStatus(lastError?: PropelError): Promise<void> {
        let newStatus: ConnectivityStatus = new ConnectivityStatus();
        newStatus.lastError = lastError;
        
        try {
            await this.svc.getStatus();
            newStatus.apiOn = true
        } catch (error) {
            newStatus.apiOn = false
        }
        
        //We will fire the event only if there is a connectivity status change or there was an 
        //error that is requiring to check the connectivity status for proper logging:
        if (this.isStatusChanged(newStatus) || newStatus.lastError) {
            this.status = Object.assign({}, newStatus);
            this.onConnectivityStatusChange.emit(newStatus);
        }
    }
    
    private initialize() {

        // this.statusNetOnlineSubscription$ = fromEvent(window, "online");
        // this.statusNetOfflineSubscription$ = fromEvent(window, "offline");

        // this.statusNetOnlineSubscription$.subscribe(() => {
        //     logger.logInfo("window.online event has been fired.");
        //     this.updateStatus();
        // });

        // this.statusNetOfflineSubscription$.subscribe(() => {
        //     logger.logWarn("window.OFFLINE event has been fired.");
        //     this.updateStatus();
        // });
        this.statusNetOnlineSubscription$ = fromEvent(window, "online")
            .subscribe(() => {
            logger.logInfo("window.online event has been fired.");
            this.updateStatus();
        });
        this.statusNetOfflineSubscription$ = fromEvent(window, "offline")
            .subscribe(() => {
            logger.logWarn("window.OFFLINE event has been fired.");
            this.updateStatus();
        });

        this.updateStatus();
    }

    private isStatusChanged(newStatus: ConnectivityStatus): boolean {
        return (this.status.apiOn != newStatus.apiOn || this.status.networkOn != newStatus.networkOn);
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
        lastError?: PropelError) {
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
    lastError?: PropelError;
}