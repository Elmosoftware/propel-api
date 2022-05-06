import { Injectable } from "@angular/core";
import { logger } from "../../../propel-shared/services/logger-service";

export const PREFIX_SEPARATOR: string = "-";

/**
 * Application pages defined in Propel with the page metadata.
 */
 @Injectable({
    providedIn: 'root'
})
export class AppPages {

    Home: PageMetadata = {
        name: "home",
        showNavBar: true,
        showSearchBox: true,
        security : {
          restricted: false, //Indicates if non-authenticated users can access the page.
          adminOnly:  false, //Indicates if only Administrators can access.
        }
    }
    Run: PageMetadata = {
        name: "run",
        showNavBar: true,
        showSearchBox: true,
        security : {
          restricted: true, 
          adminOnly:  false, 
        }
    }
    Sandbox: PageMetadata = {
        name: "sandbox",
        showNavBar: false,
        showSearchBox: true,
        security : {
          restricted: false, 
          adminOnly:  false, 
        }
    }
    Target: PageMetadata = {
        name: "target",
        showNavBar: true,
        showSearchBox: true,
        security : {
          restricted: true, 
          adminOnly:  true, 
        }
    }
    Script: PageMetadata = {
        name: "script",
        showNavBar: true,
        showSearchBox: true,
        security : {
          restricted: true, 
          adminOnly:  true, 
        }
    }
    QuickTask: PageMetadata = {
        name: "quick-task",
        showNavBar: true,
        showSearchBox: true,
        security : {
          restricted: true, 
          adminOnly:  false, 
        }
    }
    Workflow: PageMetadata = {
        name: "workflow",
        showNavBar: true,
        showSearchBox: true,
        security : {
          restricted: true, 
          adminOnly:  true, 
        }
    }
    Results: PageMetadata = {
        name: "results",
        showNavBar: true,
        showSearchBox: true,
        security : {
          restricted: false, 
          adminOnly:  false, 
        }
    }
    BrowseWorkflows: PageMetadata = {
        name: "browse-workflows",
        showNavBar: true,
        showSearchBox: false,
        security : {
          restricted: true, 
          adminOnly:  false, 
        }
    }
    BrowseScripts: PageMetadata = {
        name: "browse-scripts",
        showNavBar: true,
        showSearchBox: false,
        security : {
          restricted: true, 
          adminOnly:  false, 
        }
    }
    BrowseTargets: PageMetadata = {
        name: "browse-targets",
        showNavBar: true,
        showSearchBox: false,
        security : {
          restricted: true, 
          adminOnly:  false, 
        }
    }
    BrowseCredentials: PageMetadata = {
        name: "browse-credentials",
        showNavBar: true,
        showSearchBox: false,
        security : {
          restricted: true, 
          adminOnly:  true, 
        }
    }
    BrowseUserAccounts: PageMetadata = {
        name: "browse-useraccounts",
        showNavBar: true,
        showSearchBox: false,
        security : {
          restricted: true, 
          adminOnly:  true, 
        }
    }
    History: PageMetadata = {
        name: "history",
        showNavBar: true,
        showSearchBox: true,
        security : {
          restricted: false, 
          adminOnly:  false, 
        }
    }
    Offline: PageMetadata = {
        name: "offline",
        showNavBar: true,
        showSearchBox: true,
        security : {
          restricted: false, 
          adminOnly:  false, 
        }
    }
    Unauthorized: PageMetadata = {
        name: "unauthorized",
        showNavBar: true,
        showSearchBox: true,
        security : {
          restricted: false, 
          adminOnly:  false, 
        }
    }
    Credential: PageMetadata = {
        name: "credential",
        showNavBar: true,
        showSearchBox: true,
        security : {
          restricted: true, 
          adminOnly:  true, 
        }
    }
    CredentialWindows: PageMetadata = {
        name: "credential-windows",
        showNavBar: true,
        showSearchBox: true,
        security : {
          restricted: true, 
          adminOnly:  true, 
        }
    }
    CredentialAWS: PageMetadata = {
        name: "credential-aws",
        showNavBar: true,
        showSearchBox: true,
        security : {
          restricted: true, 
          adminOnly:  true, 
        }
    }
    CredentialAPIKey: PageMetadata = {
        name: "credential-apikey",
        showNavBar: true,
        showSearchBox: true,
        security : {
          restricted: true, 
          adminOnly:  true, 
        }
    }
    UserAccount: PageMetadata = {
        name: "useraccount",
        showNavBar: true,
        showSearchBox: true,
        security : {
          restricted: true, 
          adminOnly:  true, 
        }
    }
    Login: PageMetadata = {
        name: "login",
        showNavBar: false,
        showSearchBox: true,
        security : {
          restricted: false, 
          adminOnly:  false, 
        }
    }

    constructor() {    
        logger.logInfo("ApplicationPages instance created");
    }

    /**
     * If the name of the page is wrong or missing an empty PageMetadata object will be returned.
     * @param name App page name
     * @returns the page metadata for the requested page.
     */
    getPageFromName(name: string): PageMetadata {

        let ret: PageMetadata;
        let props = Object.getOwnPropertyNames(this)
        
        props.forEach((key: string) => {
            if (this[key].name == name) {
                ret = this[key];
            }
        });

        if(!ret) {
            ret = new PageMetadata();
        }

        return ret;
    }

    /**
     * Some of the pages are related to each other and therefore they share a common prefix. 
     * This method allows to extract and retrieve that prefix.
     * @example
     * getPrefix({
     *  name: "account-details"
     * }) --> "account-"
     * @param page Page which prefixwe would like to obtain.
     * @returns The page prefix.
     */
    getPrefix(page: PageMetadata): string {
        let pos = page.name.indexOf(PREFIX_SEPARATOR);
        let ret: string = ""

        if (pos != -1) {
            ret = page.name.slice(0, pos + 1);
        }

        return ret;
    }
}

/**
 * This contain the page metadata that allows to configure different 
 * aspects of each application page visuals.
 * Like when the and how the Nav bar willbe displayed, etc.
 */
 export class PageMetadata {

    /**
     * Page name or URIis the name you use tonavigate to the page like "home" in http://propel/home
     */
    name: string = "";

    /**
     * A boolean value indicating if the Navigation bar is goingto be visible when a redirection 
     * to the page occurs.
     */
    showNavBar: boolean = false;

    /**
     * A boolean value indicating if the Navigation bar search box is going to be visible when 
     * a redirection to the page occurs.
     */
    showSearchBox: boolean = false;

    /**
     * Page security details, indicating theroles that are granting access, etc..
     */
    security: PageSecurity;

    constructor() {
        
    }
}

/**
 * Page security class contains attributes that indicates some security features like if 
 * non authenticated users can acces or which roles will be forbidden and which not.
 */
export class PageSecurity {

    /**
     * Indicates if non-authenticated users can access the page.
     */
    restricted: boolean;
    
    /**
     * Indicates if only Administrators can access.
     */
    adminOnly: boolean;
    
    constructor() {
        
    }
}
export let pages: AppPages = new AppPages();