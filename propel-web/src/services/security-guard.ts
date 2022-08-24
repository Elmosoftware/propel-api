import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { PageMetadata } from './app-pages.service';
import { CoreService } from "./core.service";

@Injectable()
export class SecurityGuard implements CanActivate {

    constructor(private core: CoreService) {
    }

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

        let ret: boolean = true;
        let page: PageMetadata = this.core.navigation.getPageFromURL(state.url)

        ret = this.core.security.isAccessGranted(page);

        if (!ret) {
            if (this.core.security.isUserLoggedIn) {
                this.core.navigation.toUnauthorized();
            }
            else {
                this.core.navigation.toLogin(state.url);
            }
        }

        return ret;
    }
}
