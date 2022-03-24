import { Injectable, EventEmitter } from "@angular/core";
import { Router } from '@angular/router';

import { logger } from "../../../propel-shared/services/logger-service";
import { CredentialTypes, DEFAULT_CREDENTIAL_TYPE } from "../../../propel-shared/models/credential-types";

/**
 * This enums all the Pages in the app.
 */
export const enum PAGES {
    Home = "home",
    Run = "run",
    Sandbox = "sandbox",
    Target = "target",
    Script = "script",
    QuickTask = "quick-task",
    Workflow = "workflow",
    Results = "results",
    BrowseWorkflows = "browse-workflows",
    BrowseScripts = "browse-scripts",
    BrowseTargets = "browse-targets",
    BrowseCredentials = "browse-credentials",
    BrowseUserAccounts = "browse-useraccounts",
    History = "history",
    Offline = "offline",
    EditCredential = "credential",
    CredentialWindows = "credential-windows",
    CredentialAWS = "credential-aws",
    CredentialAPIKey = "credential-apikey",
    UserAccount = "user-account"
}

export const SUFFIX_SEPARATOR: string = "-";

/**
 * This class acts as a helper to navigate the different pages in the app.
 */
@Injectable({
    providedIn: 'root'
})
export class NavigationService {

    private _currPageRXP: RegExp;
    private _requestCounter: number = 0;
    private httpRequestCountEmitter$: EventEmitter<number> = new EventEmitter<number>(); 

    /**
     * Returns the amount of requests currently in progress.
     */
    get requestCounter(): number {
        return this._requestCounter;
    }

    get credentialsPagePrefix(): string{
        return "credential"
    }

    get browsePagePrefix(): string{
        return "browse"
    }

    constructor(private router: Router) {
        this._currPageRXP = new RegExp("^/[A-Za-z-]*", "gi");
        logger.logInfo("Navigationservice instance created")
    }

    httpReqStarted() {
        this._requestCounter++;
        this.httpRequestCountEmitter$.emit(this._requestCounter);
    }

    httpReqEnded() {
        this._requestCounter--;

        if (this._requestCounter < 0) {
            this._requestCounter = 0;
        }
        this.httpRequestCountEmitter$.emit(this._requestCounter);
    }

    /**
     * Subscribe to the request count event emitter.
     */
    getHttpRequestCountSubscription(): EventEmitter<number> {
        return this.httpRequestCountEmitter$;
    }

    /**
     * Retrieves the name of the current active page.
     */
    currentPage(): string {
        let matches: any;
        let ret: string = "";

        matches = this.router.url.match(this._currPageRXP);

        if (matches && matches.length > 0) {
            ret = matches[0].slice(1); //Removing the initial forwardslash.
        }

        return ret;
    }

    /**
     * We defined the value SUFFIX_SEPARATOR that will be used to separate names in page urls.
     * In this way the app can find the last part of the name and operate with it.
     * @returns The suffix in the current page. 
     * For example sif the value in SUFFIX_SEPARATOR is set to "-". Then if we navigate to the 
     * page "sample-withsuffix". A call to this method will return "withsuffix". 
     */
    getCurrentPageSuffix(): string {
        let ret = "";
        let page = this.currentPage();
        let index: number = page.indexOf("-");

        if (index != -1) {
            ret = page.substring(index + 1)
        }

        return ret;
    }

    /**
     * Navigate to Home page.
     */
    toHome(): void {
        this.router.navigate([this.getRelativePath(PAGES.Home)]);
    }

    /**
     * Navigate to Run page.
     * @param workflowId Workflow to run
     */
    toRun(workflowId: string): void {
        this.router.navigate([this.getRelativePath(PAGES.Run), workflowId]);
    }

    /**
     * Navigate to the Execution Results page.
     * @param executionLogId Log id.
     */
    toResults(executionLogId: string): void {
        this.router.navigate([this.getRelativePath(PAGES.Results), executionLogId]);
    }

    /**
     * Allows to create or edit a target.
     * @param targetId Target to edit.
     */
    toTarget(targetId?: string): void {
        if (targetId) {
            this.router.navigate([this.getRelativePath(PAGES.Target), targetId]);
        }
        else {
            this.router.navigate([this.getRelativePath(PAGES.Target)]);
        }
    }

    /**
     * Allows to create or edit a script.
     * @param scriptId Script to edit.
     */
    toScript(scriptId?: string): void {
        if (scriptId) {
            this.router.navigate([this.getRelativePath(PAGES.Script), scriptId]);
        }
        else {
            this.router.navigate([this.getRelativePath(PAGES.Script)]);
        }
    }

    /**
     * Navigate to Quick Task page.
     */
    toQuickTask(): void {
        this.router.navigate([this.getRelativePath(PAGES.QuickTask)]);
    }

    /**
     * Allows to create or edit a workflow.
     * @param workflowId Script to edit.
     */
    toWorkflow(workflowId?: string): void {
        if (workflowId) {
            this.router.navigate([this.getRelativePath(PAGES.Workflow), workflowId]);
        }
        else {
            this.router.navigate([this.getRelativePath(PAGES.Workflow)]);
        }
    }

    /**
     * Navigate to search page but setting up to browse worflows.
     * @param term Term to search for.
     * @param browse Indicates if even no term is specified, we must show all items.
     */
    toBrowseWorkflows(term:string = "", browse:boolean = true): void {
        this.router.navigate([this.getRelativePath(PAGES.BrowseWorkflows)], {
            queryParams: { term: String(term), browse: (browse) ? "true" : "false" }
        });
    }

    /**
     * Navigate to search page but setting up to browse scripts.
     */
    toBrowseScripts(term:string = "", browse:boolean = true): void {
        this.router.navigate([this.getRelativePath(PAGES.BrowseScripts)], {
            queryParams: { term: String(term), browse: (browse) ? "true" : "false" }
        });
    }

    /**
     * Navigate to search page but setting up to browse targets.
     */
    toBrowseTargets(term:string = "", browse:boolean = true): void {
        this.router.navigate([this.getRelativePath(PAGES.BrowseTargets)], {
            queryParams: { term: String(term), browse: (browse) ? "true" : "false" }
        });
    }

    /**
     * Navigate to search page but setting up to browse credentials.
     */
    toBrowseCredentials(term:string = "", browse:boolean = true): void {
        this.router.navigate([this.getRelativePath(PAGES.BrowseCredentials)], {
            queryParams: { term: String(term), browse: (browse) ? "true" : "false" }
        });
    }

    /**
     * Navigate to search page but setting up to browse user accounts.
     */
    toBrowseUserAccounts(term:string = "", browse:boolean = true): void {
        this.router.navigate([this.getRelativePath(PAGES.BrowseUserAccounts)], {
            queryParams: { term: String(term), browse: (browse) ? "true" : "false" }
        });
    }

    /**
     * Navigates to History page.
     */
    toHistory(): void {
        this.router.navigate([this.getRelativePath(PAGES.History)]);
    }

    /**
     * Navigates to credential page passing a credential ID. This method will provide everything 
     * required to the Credential component to edit the credential.
     * If instead of a credential ID, a credential type is provided, the Credential component
     * will prepare a form to create a new credential of the specified type.
     * If neither CredentialId or type is specified, a new credential of type DEFAULT_CREDENTIAL_TYPE 
     * will be created and ready.
     * @param credentialId The credential to edit
     */
    toCredential(credentialId?: string, type?: CredentialTypes) {
        let page: string = this.credentialsPagePrefix + SUFFIX_SEPARATOR + 
            ((type) ? type : DEFAULT_CREDENTIAL_TYPE).toString()
            .toLowerCase();
        
        if (credentialId) {
            this.router.navigate([this.getRelativePath(PAGES.EditCredential), credentialId]);
        }
        else {
            this.router.navigate([page]);
        }
    }

    /**
     * Used by the system tonavigate to the offline page if a network issue is detected.
     */
    toOffline(): void {
        this.router.navigate([this.getRelativePath(PAGES.Offline)]);
    }

     /**
     * Allows to create or edit a user account.
     * @param targetId Target to edit.
     */
    toUserAccount(userAccountId?: string): void {
        if (userAccountId) {
            this.router.navigate([this.getRelativePath(PAGES.UserAccount), userAccountId]);
        }
        else {
            this.router.navigate([this.getRelativePath(PAGES.UserAccount)]);
        }
    }

    /**
     * Navigate to sandbox page. For testing purposes only.
     * This will not be available in production.
     */
    toSandbox(): void {
        this.router.navigate([this.getRelativePath(PAGES.Sandbox)]);
    }

    private getRelativePath(page: PAGES): string {
        return `/${page}`;
    }
}