import { Injectable, EventEmitter } from "@angular/core";
import { Router } from '@angular/router';

import { logger } from "../../../propel-shared/services/logger-service";
import { SearchType } from 'src/app/search/search.component';

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
    Search = "search",
    BrowseWorkflows = "browse-workflows",
    BrowseScripts = "browse-scripts",
    BrowseTargets = "browse-targets"
}

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
     * Navigate to Search page.
     */
    toSearch(type: SearchType = SearchType.Workflows, term: string = "", browse: string = "false"): void {
        this.router.navigate([this.getRelativePath(PAGES.Search)], {
            queryParams: { type: type.toString(), term: term, browse: browse }
        });
    }

    toBrowseWorkflows(): void {
        this.router.navigate([this.getRelativePath(PAGES.BrowseWorkflows)], {
            queryParams: { type: SearchType.Workflows.toString(), term: "", browse: "true" }
        });
    }

    toBrowseScripts(): void {
        this.router.navigate([this.getRelativePath(PAGES.BrowseScripts)], {
            queryParams: { type: SearchType.Scripts.toString(), term: "", browse: "true" }
        });
    }

    toBrowseTargets(): void {
        this.router.navigate([this.getRelativePath(PAGES.BrowseTargets)], {
            queryParams: { type: SearchType.Targets.toString(), term: "", browse: "true" }
        });
    }

    toSandbox(): void {
        this.router.navigate([this.getRelativePath(PAGES.Sandbox)]);
    }

    private getRelativePath(page: PAGES): string {
        return `/${page}`;
    }
}