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

    constructor() {
    }

    canDeactivate(component: DataLossPreventionInterface, currentRoute: ActivatedRouteSnapshot,
        currentState: RouterStateSnapshot, nextState: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        
        if (!component.dataChanged) {
            throw new Error(`The supplied component is not implementing "DataLossPreventionInterface".
            This can be caused by the "canDeactivate" attribute set to "DataLossPreventionGuard" class for the component route, but the 
            component is not implementing the interface yet.`);   
        }
        else {
            return component.dataChanged();
        }   
    }

}
