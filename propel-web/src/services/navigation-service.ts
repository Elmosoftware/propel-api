import { Injectable } from "@angular/core";
import { Router, UrlSegment } from '@angular/router';
import { logger } from "../../../propel-shared/services/logger-service";

/**
 * This enums all the Pages in the app.
 */
export const enum PAGES {
    Home = "home",
    Sandbox = "sandbox"
}

/**
 * This class acts as a helper to navigate the different pages in the app.
 */
@Injectable({
    providedIn: 'root'
})
export class NavigationService {
    constructor(private router: Router) {
        logger.logInfo("Navigationservice instance created")
    }

    parsePageURL(url: UrlSegment): PAGES {

        if (url && url.path) {
            switch (url.path.toLowerCase()) {
                case PAGES.Home:
                    return PAGES.Home
                case PAGES.Sandbox:
                    return PAGES.Sandbox
                default:
                    throw new Error(`Page "${url.path.toLowerCase()}" is not been defined yet in PAGES enumeration.`)
            }
        }
        else {
            throw new Error(`Invalid URL segment sent.`);
        }
    }

    toHome(): void {
        this.router.navigate([this.getRelativePath(PAGES.Home)]);
    }

    toSandbox(): void {
        this.router.navigate([this.getRelativePath(PAGES.Sandbox)]);
    }

    private getRelativePath(page: PAGES): string {
        return `/${page}`;
    }
}