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
    title: "Home",
    name: "home",
    showNavBar: true,
    showSearchBox: true,
    security: {
      restricted: false,
      adminOnly: false,
    },
    excludeFromHistory: false
  }

  Run: PageMetadata = {
    title: "Run",
    name: "run",
    showNavBar: true,
    showSearchBox: true,
    security: {
      restricted: true,
      adminOnly: false,
    },
    excludeFromHistory: false
  }

  Sandbox: PageMetadata = {
    title: "Sandbox",
    name: "sandbox",
    showNavBar: false,
    showSearchBox: true,
    security: {
      restricted: false,
      adminOnly: false,
    },
    excludeFromHistory: false
  }

  Target: PageMetadata = {
    title: "Target",
    name: "target",
    showNavBar: true,
    showSearchBox: true,
    security: {
      restricted: true,
      adminOnly: true,
    },
    excludeFromHistory: false
  }

  Script: PageMetadata = {
    title: "Script",
    name: "script",
    showNavBar: true,
    showSearchBox: true,
    security: {
      restricted: true,
      adminOnly: true,
    },
    excludeFromHistory: false
  }

  QuickTask: PageMetadata = {
    title: "Quick Task",
    name: "quick-task",
    showNavBar: true,
    showSearchBox: true,
    security: {
      restricted: true,
      adminOnly: false,
    },
    excludeFromHistory: false
  }

  Workflow: PageMetadata = {
    title: "Workflow",
    name: "workflow",
    showNavBar: true,
    showSearchBox: true,
    security: {
      restricted: true,
      adminOnly: true,
    },
    excludeFromHistory: false
  }

  Results: PageMetadata = {
    title: "Execution Results",
    name: "results",
    showNavBar: true,
    showSearchBox: true,
    security: {
      restricted: false,
      adminOnly: false,
    },
    excludeFromHistory: false
  }

  BrowseWorkflows: PageMetadata = {
    title: "Workflows",
    name: "browse-workflows",
    showNavBar: true,
    showSearchBox: false,
    security: {
      restricted: true,
      adminOnly: false,
    },
    excludeFromHistory: false
  }

  BrowseScripts: PageMetadata = {
    title: "Scripts",
    name: "browse-scripts",
    showNavBar: true,
    showSearchBox: false,
    security: {
      restricted: true,
      adminOnly: false,
    },
    excludeFromHistory: false
  }

  BrowseTargets: PageMetadata = {
    title: "Targets",
    name: "browse-targets",
    showNavBar: true,
    showSearchBox: false,
    security: {
      restricted: true,
      adminOnly: false,
    },
    excludeFromHistory: false
  }

  BrowseCredentials: PageMetadata = {
    title: "Credentials",
    name: "browse-credentials",
    showNavBar: true,
    showSearchBox: false,
    security: {
      restricted: true,
      adminOnly: true,
    },
    excludeFromHistory: false
  }

  BrowseUserAccounts: PageMetadata = {
    title: "Manage Users",
    name: "browse-useraccounts",
    showNavBar: true,
    showSearchBox: false,
    security: {
      restricted: true,
      adminOnly: true,
    },
    excludeFromHistory: false
  }

  History: PageMetadata = {
    title: "Execution History",
    name: "history",
    showNavBar: true,
    showSearchBox: true,
    security: {
      restricted: false,
      adminOnly: false,
    },
    excludeFromHistory: false
  }

  Offline: PageMetadata = {
    title: "Offline",
    name: "offline",
    showNavBar: true,
    showSearchBox: true,
    security: {
      restricted: false,
      adminOnly: false,
    },
    excludeFromHistory: true
  }

  Unauthorized: PageMetadata = {
    title: "Unauthorized",
    name: "unauthorized",
    showNavBar: true,
    showSearchBox: true,
    security: {
      restricted: false,
      adminOnly: false,
    },
    excludeFromHistory: true
  }

  CredentialWindows: PageMetadata = {
    title: "Windows Credential",
    name: "credential-windows",
    showNavBar: true,
    showSearchBox: true,
    security: {
      restricted: true,
      adminOnly: true,
    },
    excludeFromHistory: false
  }

  CredentialAWS: PageMetadata = {
    title: "AWS Credential",
    name: "credential-aws",
    showNavBar: true,
    showSearchBox: true,
    security: {
      restricted: true,
      adminOnly: true,
    },
    excludeFromHistory: false
  }

  CredentialAPIKey: PageMetadata = {
    title: "Generic API Key Credential",
    name: "credential-apikey",
    showNavBar: true,
    showSearchBox: true,
    security: {
      restricted: true,
      adminOnly: true,
    },
    excludeFromHistory: false
  }

  CredentialDatabase: PageMetadata = {
    title: "Database Credential",
    name: "credential-database",
    showNavBar: true,
    showSearchBox: true,
    security: {
      restricted: true,
      adminOnly: true,
    },
    excludeFromHistory: false
  }

  UserAccount: PageMetadata = {
    title: "User Account",
    name: "useraccount",
    showNavBar: true,
    showSearchBox: true,
    security: {
      restricted: true,
      adminOnly: true,
    },
    excludeFromHistory: false
  }
  
  SystemJobs: PageMetadata = {
    title: "System Jobs",
    name: "system-jobs",
    showNavBar: true,
    showSearchBox: true,
    security: {
      restricted: true,
      adminOnly: true,
    },
    excludeFromHistory: false
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

    let ret: PageMetadata | undefined;
    let props = Object.getOwnPropertyNames(this)

    props.forEach((key: string) => {
      if ((this as any)[key].name == name) {
        ret = (this as any)[key];
      }
    });

    if (!ret) {
      ret = new PageMetadata();
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
   * Page title.
   */
  title: string = "";

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
  security!: PageSecurity;

  /**
   * Indicates if the page need to be excluded from navigation history.
   */
  excludeFromHistory: boolean = false;

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
  restricted!: boolean;

  /**
   * Indicates if only Administrators can access.
   */
  adminOnly!: boolean;

  constructor() {

  }
}
export let pages: AppPages = new AppPages();