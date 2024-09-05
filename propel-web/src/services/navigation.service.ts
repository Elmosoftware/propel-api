import { Injectable, EventEmitter } from "@angular/core";
import { NavigationEnd, Params, Router } from '@angular/router';

import { logger } from "../../../propel-shared/services/logger-service";
import { PageMetadata, AppPages } from "src/services/app-pages.service";
import { PropelError } from "../../../propel-shared/core/propel-error";
import { DataLossPreventionGuard } from "src/core/data-loss-prevention-guard";

const MAX_HISTORY_LENGTH: number = 15

export type NavigationHistoryEntry = { url: string, title: string }

/**
 * This class acts as a helper to navigate the different pages in the app.
 */
@Injectable({
    providedIn: 'root'
})
export class NavigationService {

    private _currPageRXP: RegExp;
    private _requestCounter: number = 0;
    private _history: NavigationHistoryEntry[] = [];
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

    /**
    * Retrieves the name of the current active page.
    */
    get currentPage(): PageMetadata {
        return this.getPageFromURL(this.router.url);
    }

    get previousPage(): NavigationHistoryEntry | undefined {
        //Recall that last item in the History is the current page, not the previous one:
        return this._history[this._history.length - 2];
    }

    constructor(private router: Router, private appPages: AppPages, private guard: DataLossPreventionGuard) {
        this._currPageRXP = new RegExp("^/[A-Za-z-]*", "gi");
        logger.logInfo("Navigationservice instance created");

        this.router.events.subscribe({
            next: (event) => {
                if (event instanceof NavigationEnd) {
                    this.addToHistory(event.urlAfterRedirects)
                }
            }
        })
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
     * Returns a boolean value indicating if the current page is the specified one.
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
     * PageMetadata corresponding to the specified URL.
     * @param url URL from where to extract the page.
     * @returns The PageMetadata or a new PageMetadata if the page is not defined.
     */
    getPageFromURL(url: string): PageMetadata {
        let ret: PageMetadata;
        let matches = String(url).match(this._currPageRXP);

        if (matches && matches.length > 0) {
            ret = this.appPages.getPageFromName(matches[0].slice(1)); //Removing the initial forwardslash.
        }
        else {
            ret = new PageMetadata();
        }

        return ret;
    }

    /**
     * Navigates to the previous page.
     */
    back(): void {

        if (this._history.length > 1) {
            this._history.pop();
        }

        this.to(this._history[this._history.length - 1]?.url)
    }

    replaceHistory(segments: string[] | string = "", queryParams: Params | null = null): void {
        let url: string = ""
        let entry: NavigationHistoryEntry;

        if (this._history.length == 0) return;

        entry = this._history[this._history.length - 1]
        entry.url = this.buildURL(this.currentPage, segments, queryParams);
    }

    buildURL(page: PageMetadata, segments: string[] | string = "", queryParams: Params | null = null): string {

        if (!page) throw new PropelError(`Expect the page metadata in the "buildURL" method but a falsy value was passed.`)

        if (!segments) {
            segments = [];
        }
        else if (!Array.isArray(segments)) {
            segments = [String(segments)]
        }

        //Inserting the page as the first segment:
        segments = [page.name, ...segments]

        if (queryParams) {
            queryParams = { queryParams }
        }
        else {
            queryParams = {}
        }

        return this.router.createUrlTree(segments, queryParams).toString();
    }

    /**
     * Navigate to the requested url.
     */
    to(url: string): void {
        if (!url) return;
        this.router.navigateByUrl(url);
    }

    /**
     * Navigate to Home page. If the parameter force is set with the boolean value true, any data 
     * guard implemented will be temporarily disabled to allow the navigation safely.
     * @param force Force navigation overriding any data guard that could prevent the navigation.
     */
    toHome(force: boolean = false): void {
        let url: string = this.buildURL(this.pages.Home);
        if (force) this.guard.deactivate = true;
        this.to(url)
    }

    /**
     * Navigate to Run page.
     * @param workflowId Workflow to run
     */
    toRun(workflowId: string, confirmationRequired: boolean = false): void {
        let url: string = this.buildURL(this.pages.Run, workflowId, { conf: String(confirmationRequired) });
        this.to(url)
    }

    /**
     * Navigate to the Execution Results page.
     * @param executionLogId Log id.
     */
    toResults(executionLogId: string): void {
        let url: string = this.buildURL(this.pages.Results, executionLogId);
        this.to(url)
    }

    /**
     * Allows to create or edit a target.
     * @param targetId Target to edit.
     */
    toTarget(targetId?: string): void {
        let url: string = this.buildURL(this.pages.Target, targetId);
        this.to(url)
    }

    /**
     * Allows to create or edit a script.
     * @param scriptId Script to edit.
     */
    toScript(scriptId?: string): void {
        let url: string = this.buildURL(this.pages.Script, scriptId);
        this.to(url)
    }

    /**
     * Navigate to Quick Task page.
     */
    toQuickTask(): void {
        let url: string = this.buildURL(this.pages.QuickTask);
        this.to(url)
    }

    /**
     * Allows to create or edit a workflow.
     * @param workflowId Script to edit.
     */
    toWorkflow(workflowId?: string): void {
        let url: string = this.buildURL(this.pages.Workflow, workflowId);
        this.to(url)
    }

    /**
     * Navigate to search page but setting up to browse worflows.
     * @param term Term to search for.
     * @param browse Indicates if even no term is specified, we must show all items.
     */
    toBrowseWorkflows(term: string = "", browse: boolean = true): void {
        let url: string = this.buildURL(this.pages.BrowseWorkflows, "",
            { term: String(term), browse: (browse) ? "true" : "false" });
        this.to(url)
    }

    /**
     * Navigate to search page but setting up to browse scripts.
     */
    toBrowseScripts(term: string = "", browse: boolean = true): void {
        let url: string = this.buildURL(this.pages.BrowseScripts, "",
            { term: String(term), browse: (browse) ? "true" : "false" });
        this.to(url)
    }

    /**
     * Navigate to search page but setting up to browse targets.
     */
    toBrowseTargets(term: string = "", browse: boolean = true): void {
        let url: string = this.buildURL(this.pages.BrowseTargets, "",
            { term: String(term), browse: (browse) ? "true" : "false" });
        this.to(url)
    }

    /**
     * Navigate to search page but setting up to browse credentials.
     */
    toBrowseCredentials(term: string = "", browse: boolean = true): void {
        let url: string = this.buildURL(this.pages.BrowseCredentials, "",
            { term: String(term), browse: (browse) ? "true" : "false" });
        this.to(url)
    }

    /**
     * Navigate to search page but setting up to browse user accounts.
     */
    toBrowseUserAccounts(term: string = "", browse: boolean = true): void {
        let url: string = this.buildURL(this.pages.BrowseUserAccounts, "",
            { term: String(term), browse: (browse) ? "true" : "false" });
        this.to(url)
    }

    /**
     * Navigates to History page.
     */
    toHistory(): void {
        let url: string = this.buildURL(this.pages.History);
        this.to(url)
    }

    /**
     * Navigate to Credential page and set the form to create a new Windows Credential.
     */
    toWindowsCredential(credentialId?: string) {
        let url: string = this.buildURL(this.pages.CredentialWindows, credentialId);
        this.to(url)
    }

    /**
     * Navigate to Credential page and set the form to create a new AWS Credential.
     */
    toAWSCredential(credentialId?: string) {
        let url: string = this.buildURL(this.pages.CredentialAWS, credentialId);
        this.to(url)
    }

    /**
     * Navigate to Credential page and set the form to create a new Generic API Key Credential.
     */
    toGenericAPIKeyCredential(credentialId?: string) {
        let url: string = this.buildURL(this.pages.CredentialAPIKey, credentialId);
        this.to(url)
    }

    /**
     * Navigate to Credential page and set the form to create a new Database Credential.
     */
    toDatabaseCredential(credentialId?: string) {
        let url: string = this.buildURL(this.pages.CredentialDatabase, credentialId);
        this.to(url)
    }

    /**
     * Used by the system to navigate to the offline page if a network issue is detected.
     */
    toOffline(): void {
        let url: string = this.buildURL(this.pages.Offline);
        this.to(url)
    }

    /**
     * Used by the system to indicate the user the access is forbidden.
     */
    toUnauthorized(): void {
        let url: string = this.buildURL(this.pages.Unauthorized);
        this.to(url)
    }

    /**
    * Allows to create or edit a user account.
    * @param targetId Target to edit.
    */
    toUserAccount(userAccountId?: string): void {
        let url: string = this.buildURL(this.pages.UserAccount, userAccountId);
        this.to(url)
    }

    /**
     * Allows access to Propel internals System jobs logs and stats.
     */
    toSystemJobs(): void {
        let url: string = this.buildURL(this.pages.SystemJobs);
        this.to(url)
    }

    /**
     * Allows access to Propel stats on Object pool usage.
     */
    toObjectPoolStats(): void {
        let url: string = this.buildURL(this.pages.ObjectPoolStats);
        this.to(url)
    }

    /**
     * Navigate to sandbox page. For testing purposes only.
     * This will not be available in production.
     */
    toSandbox(): void {
        let url: string = this.buildURL(this.pages.Sandbox);
        this.to(url)
    }

    private addToHistory(url: string): void {
        let m: PageMetadata;

        if (!url) return;
        url = decodeURIComponent(url);
        m = this.getPageFromURL(url);

        if (m.name && !m.excludeFromHistory && !this.alreadyInHistory(url)) {
            if (this._history.length == MAX_HISTORY_LENGTH) {
                this._history.shift();
            }
            this._history.push({
                url: url,
                title: m.title
            })
        }
    }

    private alreadyInHistory(url: string): boolean {
        if (this._history.length == 0) return false;
        if (this._history[this._history.length - 1]?.url == url) return true
        return false
    }
}