import { Injectable, EventEmitter } from "@angular/core";
import { Router } from '@angular/router';

import { logger } from "../../../propel-shared/services/logger-service";
import { CredentialTypes, DEFAULT_CREDENTIAL_TYPE } from "../../../propel-shared/models/credential-types";
import { PageMetadata, AppPages } from "src/services/app-pages.service";



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

    get pages(): AppPages {
        return this.appPages;
    }

    /**
     * Returns the amount of requests currently in progress.
     */
    get requestCounter(): number {
        return this._requestCounter;
    }

    get credentialsPagePrefix(): string {
        return "credential"
    }

    get browsePagePrefix(): string {
        return "browse"
    }

    /**
    * Retrieves the name of the current active page.
    */
    get currentPage(): PageMetadata {
        let matches: any;
        let ret: PageMetadata;

        matches = this.router.url.match(this._currPageRXP);

        if (matches && matches.length > 0) {
            ret = this.appPages.getPageFromName(matches[0].slice(1)); //Removing the initial forwardslash.
        }
        else {
            ret = new PageMetadata();
        }

        return ret;
    }

    constructor(private router: Router, private appPages: AppPages) {
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
     * Returns aboolean value indicating if the current page is the provided one.
     * @param page Page to check
     * @returns A boolean value indicating in the provided page is the current page.
     */
    currentPageIs(page: PageMetadata): boolean {
        return this.currentPage.name == page.name;
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
        let page: PageMetadata = this.currentPage;

        if (!page) return ret;

        let index: number = page.name.indexOf("-");

        if (index != -1) {
            ret = page.name.substring(index + 1)
        }

        return ret;
    }

    /**
     * Navigate to Home page.
     */
    toHome(): void {
        this.router.navigate([this.getRelativePath(this.pages.Home.name)]);
    }

    /**
     * Navigate to Login page.
     */
    toLogin(): void {
        this.router.navigate([this.getRelativePath(this.pages.Login.name)]);
    }

    /**
     * Navigate to Run page.
     * @param workflowId Workflow to run
     */
    toRun(workflowId: string): void {
        this.router.navigate([this.getRelativePath(this.pages.Run.name), workflowId]);
    }

    /**
     * Navigate to the Execution Results page.
     * @param executionLogId Log id.
     */
    toResults(executionLogId: string): void {
        this.router.navigate([this.getRelativePath(this.pages.Results.name), executionLogId]);
    }

    /**
     * Allows to create or edit a target.
     * @param targetId Target to edit.
     */
    toTarget(targetId?: string): void {
        if (targetId) {
            this.router.navigate([this.getRelativePath(this.pages.Target.name), targetId]);
        }
        else {
            this.router.navigate([this.getRelativePath(this.pages.Target.name)]);
        }
    }

    /**
     * Allows to create or edit a script.
     * @param scriptId Script to edit.
     */
    toScript(scriptId?: string): void {
        if (scriptId) {
            this.router.navigate([this.getRelativePath(this.pages.Script.name), scriptId]);
        }
        else {
            this.router.navigate([this.getRelativePath(this.pages.Script.name)]);
        }
    }

    /**
     * Navigate to Quick Task page.
     */
    toQuickTask(): void {
        this.router.navigate([this.getRelativePath(this.pages.QuickTask.name)]);
    }

    /**
     * Allows to create or edit a workflow.
     * @param workflowId Script to edit.
     */
    toWorkflow(workflowId?: string): void {
        if (workflowId) {
            this.router.navigate([this.getRelativePath(this.pages.Workflow.name), workflowId]);
        }
        else {
            this.router.navigate([this.getRelativePath(this.pages.Workflow.name)]);
        }
    }

    /**
     * Navigate to search page but setting up to browse worflows.
     * @param term Term to search for.
     * @param browse Indicates if even no term is specified, we must show all items.
     */
    toBrowseWorkflows(term: string = "", browse: boolean = true): void {
        this.router.navigate([this.getRelativePath(this.pages.BrowseWorkflows.name)], {
            queryParams: { term: String(term), browse: (browse) ? "true" : "false" }
        });
    }

    /**
     * Navigate to search page but setting up to browse scripts.
     */
    toBrowseScripts(term: string = "", browse: boolean = true): void {
        this.router.navigate([this.getRelativePath(this.pages.BrowseScripts.name)], {
            queryParams: { term: String(term), browse: (browse) ? "true" : "false" }
        });
    }

    /**
     * Navigate to search page but setting up to browse targets.
     */
    toBrowseTargets(term: string = "", browse: boolean = true): void {
        this.router.navigate([this.getRelativePath(this.pages.BrowseTargets.name)], {
            queryParams: { term: String(term), browse: (browse) ? "true" : "false" }
        });
    }

    /**
     * Navigate to search page but setting up to browse credentials.
     */
    toBrowseCredentials(term: string = "", browse: boolean = true): void {
        this.router.navigate([this.getRelativePath(this.pages.BrowseCredentials.name)], {
            queryParams: { term: String(term), browse: (browse) ? "true" : "false" }
        });
    }

    /**
     * Navigate to search page but setting up to browse user accounts.
     */
    toBrowseUserAccounts(term: string = "", browse: boolean = true): void {
        this.router.navigate([this.getRelativePath(this.pages.BrowseUserAccounts.name)], {
            queryParams: { term: String(term), browse: (browse) ? "true" : "false" }
        });
    }

    /**
     * Navigates to History page.
     */
    toHistory(): void {
        this.router.navigate([this.getRelativePath(this.pages.History.name)]);
    }

    /**
     * Navigate to one of the alias of Credential page to prepare a form for the creation
     * of a new credential of the specified type.
     * If no type is specified, a new credential of type DEFAULT_CREDENTIAL_TYPE 
     * will be created.
     * @param type The credential type.
     */
    toNewCredential(type?: CredentialTypes) {
        let prefix = this.appPages.getPrefix(this.appPages.CredentialWindows); //Getting the prefix 
        //from any credential page.
        let page: string = prefix + ((type) ? type : DEFAULT_CREDENTIAL_TYPE).toString()
            .toLowerCase();

        this.router.navigate([page]);
    }

    /**
     * Navigates to credential page passing a credential ID. This method will provide everything 
     * required to the Credential component to edit the credential.
     * @param credentialId The credential to edit
     */
    toEditCredential(credentialId: string) {
        this.router.navigate([this.getRelativePath(this.pages.Credential.name), credentialId]);
    }

    /**
     * Used by the system to navigate to the offline page if a network issue is detected.
     */
    toOffline(): void {
        this.router.navigate([this.getRelativePath(this.pages.Offline.name)]);
    }

    /**
    * Allows to create or edit a user account.
    * @param targetId Target to edit.
    */
    toUserAccount(userAccountId?: string): void {
        if (userAccountId) {
            this.router.navigate([this.getRelativePath(this.pages.UserAccount.name), userAccountId]);
        }
        else {
            this.router.navigate([this.getRelativePath(this.pages.UserAccount.name)]);
        }
    }

    /**
     * Navigate to sandbox page. For testing purposes only.
     * This will not be available in production.
     */
    toSandbox(): void {
        this.router.navigate([this.getRelativePath(this.pages.Sandbox.name)]);
    }

    private getRelativePath(page: string): string {
        return `/${page}`;
    }
}