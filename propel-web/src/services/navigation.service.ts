import { Injectable, EventEmitter } from "@angular/core";
import { Router, UrlSegment } from '@angular/router';
import { logger } from "../../../propel-shared/services/logger-service";

/**
 * This enums all the Pages in the app.
 */
export const enum PAGES {
    Home = "home",
    Run = "run",
    Sandbox = "sandbox",
    Target = "target",
    Script = "script",
    QuickTask = "quick-task"
}

/**
 * This class acts as a helper to navigate the different pages in the app.
 */
@Injectable({
    providedIn: 'root'
})
export class NavigationService {

    private _requestCounter: number = 0;
    private httpRequestCountEmitter$: EventEmitter<number> = new EventEmitter<number>();

    /**
     * Returns the amount of requests currently in progress.
     */
    get requestCounter(): number {
        return this._requestCounter;
    }

    constructor(private router: Router) {
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

    toSandbox(): void {
        this.router.navigate([this.getRelativePath(PAGES.Sandbox)]);
    }

    private getRelativePath(page: PAGES): string {
        return `/${page}`;
    }
}