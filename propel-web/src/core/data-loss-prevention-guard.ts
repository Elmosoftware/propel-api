import { Injectable } from "@angular/core";
import { Observable } from 'rxjs';
import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from "@angular/router";

/**
 * This interface must be implemented by the components that want to have the *"DatalosPreventionGuard"* guard in his route.
 */
export interface DataLossPreventionInterface {
    dataChanged(): Observable<boolean> | Promise<boolean> | boolean
}

/**
 * This guard prevent deactivating the route of any component that implements *"DatalosPreventionInterface"*.
 */
@Injectable()
export class DataLossPreventionGuard implements CanDeactivate<DataLossPreventionInterface>{

    /**
     * Flag that allows to temporarily deactivate the guard to allow a navigation even 
     * when some data can be lost.
     * 
     * This is required in some conditions like when the access token of a user can't be 
     * refreshed and it was doing some editing covered by this data guard.
     * As soon the redirection occurs, the temporal deactivation will be rolled back.
     */
    public deactivate: boolean = false

    constructor() {
    }

    canDeactivate(component: DataLossPreventionInterface, currentRoute: ActivatedRouteSnapshot,
        currentState: RouterStateSnapshot, nextState: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

        if (!component.dataChanged) throw new Error(`The supplied component is not implementing "DataLossPreventionInterface".
        This can be caused by the "canDeactivate" attribute set to "DataLossPreventionGuard" class for the component route, but the 
        component is not implementing the interface yet.`);

        if (this.deactivate) {
            this.deactivate = false;
            return true;
        }

        return component.dataChanged();
    }
}
