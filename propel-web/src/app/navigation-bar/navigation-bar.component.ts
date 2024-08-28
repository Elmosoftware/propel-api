import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';

import { CoreService } from 'src/services/core.service';
import { NavigationHistoryEntry } from 'src/services/navigation.service';
import { SecurityEvent } from 'src/services/security.service';
import { SecuritySharedConfiguration } from '../../../../propel-shared/core/security-shared-config';
import { logger } from '../../../../propel-shared/services/logger-service';

@Component({
  selector: 'app-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.css']
})
export class NavigationBarComponent implements OnInit {

  constructor(private core: CoreService, private route: ActivatedRoute) {
  }

  loading: boolean = false;
  searchTerm: string = "";
  securityEventSubscription$!: Subscription;
  _isLegacy: boolean = false;

  get isBrowseWorkflowsPage(): boolean {
    return this.core.navigation.currentPageIs(this.core.navigation.pages.BrowseWorkflows);
  }

  get isBrowseTargetsPage(): boolean {
    return this.core.navigation.currentPageIs(this.core.navigation.pages.BrowseTargets);
  }

  get isBrowseScriptsPage(): boolean {
    return this.core.navigation.currentPageIs(this.core.navigation.pages.BrowseScripts);
  }

  get isQuickTask(): boolean {
    return this.core.navigation.currentPageIs(this.core.navigation.pages.QuickTask)
  }

  get isWorkflow(): boolean {
    return this.core.navigation.currentPageIs(this.core.navigation.pages.Workflow)
  }

  get isScript(): boolean {
    return this.core.navigation.currentPageIs(this.core.navigation.pages.Script)
  }

  get isTarget(): boolean {
    return this.core.navigation.currentPageIs(this.core.navigation.pages.Target)
  }

  get isHistory(): boolean {
    return this.core.navigation.currentPageIs(this.core.navigation.pages.History)
  }

  get canAccessQuickTask(): boolean {
    return this.core.security.isAccessGranted(this.core.navigation.pages.QuickTask)
  }

  get canAccessWorkflow(): boolean {
    return this.core.security.isAccessGranted(this.core.navigation.pages.Workflow)
  }

  get canAccessScript(): boolean {
    return this.core.security.isAccessGranted(this.core.navigation.pages.Script)
  }

  get canAccessTarget(): boolean {
    return this.core.security.isAccessGranted(this.core.navigation.pages.Target)
  }

  get canAccessHistory(): boolean {
    return this.core.security.isAccessGranted(this.core.navigation.pages.History)
  }

  get canAccessBrowseWorkflows(): boolean {
    return this.core.security.isAccessGranted(this.core.navigation.pages.BrowseWorkflows)
  }

  get canAccessBrowseScripts(): boolean {
    return this.core.security.isAccessGranted(this.core.navigation.pages.BrowseScripts)
  }

  get canAccessBrowseTargets(): boolean {
    return this.core.security.isAccessGranted(this.core.navigation.pages.BrowseTargets)
  }

  get canAccessBrowseMenu(): boolean {
    return this.canAccessBrowseWorkflows || this.canAccessBrowseScripts || this.canAccessBrowseTargets;
  }

  get canAccessCredentialWindows(): boolean {
    return this.core.security.isAccessGranted(this.core.navigation.pages.CredentialWindows)
  }

  get canAccessCredentialAWS(): boolean {
    return this.core.security.isAccessGranted(this.core.navigation.pages.CredentialAWS)
  }

  get canAccessCredentialAPIKey(): boolean {
    return this.core.security.isAccessGranted(this.core.navigation.pages.CredentialAPIKey)
  }

  get canAccessCredentialDatabase(): boolean {
    return this.core.security.isAccessGranted(this.core.navigation.pages.CredentialDatabase)
  }

  get canAccessCredentials(): boolean {
    return this.canAccessCredentialWindows || this.canAccessCredentialAWS || this.canAccessCredentialAPIKey;
  }

  get canBrowseCredentials(): boolean {
    return this.core.security.isAccessGranted(this.core.navigation.pages.BrowseCredentials)
  }

  get canAccessUserAccount(): boolean {
    return this.core.security.isAccessGranted(this.core.navigation.pages.UserAccount)
  }

  get canBrowseUserAccounts(): boolean {
    return this.core.security.isAccessGranted(this.core.navigation.pages.BrowseUserAccounts)
  }

  get canBrowseSystemJobs(): boolean {
    return this.core.security.isAccessGranted(this.core.navigation.pages.SystemJobs)
  }

  get canBrowseObjectPoolStats(): boolean {
    return this.core.security.isAccessGranted(this.core.navigation.pages.ObjectPoolStats)
  }

  get canAccessMoreItems(): boolean {
    return this.canAccessTarget || this.canAccessScript || this.canAccessTarget 
      || this.canAccessCredentials || this.canAccessUserAccount || this.canBrowseCredentials
      || this.canBrowseUserAccounts
  }

  get previousPage(): NavigationHistoryEntry | undefined {
    return this.core.navigation.previousPage;
  }

  get userName(): string {
    let ret: string = "";

    if (this.isUserLoggedIn) {
      if (this.isLegacySecurityEnabled) {
        ret = this.core.security.sessionData.userName
      }
      else {
        ret = `${this.core.security.sessionData.userFullName}, (${this.core.security.sessionData.userName})`
      }
    }

    return ret;
  }

  get userInitials(): string {
    let ret: string = "";

    if (this.userName) {
      ret = this.core.security.sessionData.userInitials;
    }

    return ret;
  }

  get isUserLoggedIn(): boolean {
    return this.core.security.isUserLoggedIn;
  }

  get isLegacySecurityEnabled(): boolean {
    return this._isLegacy;
  }

  get isDevMode(): boolean {
    return !environment.production
  }

  get showNavBar(): boolean {
    let page = this.core.navigation.currentPage;
    let ret: boolean = true; //By default the navbar must be visible.

    if (page) {
      ret = Boolean(page.showNavBar);
    }

    return ret;
  }

  get showSearchBox(): boolean {
    let page = this.core.navigation.currentPage;
    let ret: boolean = true;

    if (page) {
      ret = Boolean(page.showSearchBox);
    }

    return ret;
  }

  ngOnInit(): void {
    this.core.navigation.getHttpRequestCountSubscription()
      .subscribe({
        next: (counter: number) => {
          this.loading = counter > 0;
        }
      })

    this.core.security.getConfig()
      .then((config: SecuritySharedConfiguration) => {
        this._isLegacy = config.legacySecurity;
      }, (err) => {
        logger.logError(`Not able to get Security API configuration because of the following error: "${err.message}".`)
      })
    
    //Need also to update the legacy indicator after each login:
    this.securityEventSubscription$ = this.core.security.getSecurityEventSubscription()
      .subscribe({
        next: async (event: SecurityEvent) => {
          try {
            if (event == SecurityEvent.Login) {
              this._isLegacy = (await this.core.security.getConfig()).legacySecurity;
            }
          } catch (error) {
          }
        }
      })

  }

  goBack() {
    this.core.navigation.back();
  }

  goToHome() {
    this.core.navigation.toHome();
  }

  goToTarget() {
    this.core.navigation.toTarget();
  }

  goToScript() {
    this.core.navigation.toScript();
  }

  goToQuickTask() {
    this.core.navigation.toQuickTask();
  }

  goToWorkflow() {
    this.core.navigation.toWorkflow();
  }

  goToSearch() {
    if (this.searchTerm.length < 3) return;
    this.core.navigation.toBrowseWorkflows(this.searchTerm)
    this.searchTerm = "";
  }

  goToBrowseWorkflows() {
    this.core.navigation.toBrowseWorkflows();
  }

  goToBrowseScripts() {
    this.core.navigation.toBrowseScripts();
  }

  goToBrowseTargets() {
    this.core.navigation.toBrowseTargets();
  }

  goToBrowseCredentials() {
    this.core.navigation.toBrowseCredentials();
  }

  goToBrowseUsers() {
    this.core.navigation.toBrowseUserAccounts();
  }

  goToHistory() {
    this.core.navigation.toHistory();
  }

  goToCredentialWin() {
    this.core.navigation.toWindowsCredential();
  }

  goToCredentialAWS() {
    this.core.navigation.toAWSCredential();
  }

  goToCredentialGenericAPIKey() {
    this.core.navigation.toGenericAPIKeyCredential();
  }

  goToCredentialDatabase() {
    this.core.navigation.toDatabaseCredential();
  }

  goToUserAccount() {
    this.core.navigation.toUserAccount();
  }

  goToSystemJobs() {
    this.core.navigation.toSystemJobs();
  }

  goToObjectPoolStats() {
    this.core.navigation.toObjectPoolStats();
  }

  goToSandbox() {
    if (!this.isDevMode) return;
    this.core.navigation.toSandbox();
  }

  doNotPropagate($event: any) {
    $event.stopPropagation();
  }

  getPreviousPageTooltipMessage(): string {
    if (!this.previousPage) return "";
    else return `Back to ${this.previousPage.title}`;
  }

  getNoUserTooltip(): string {
    if(this.isLegacySecurityEnabled) return this.userName
    else return "No user is logged in, contact Propel administrators to be granted if needed."
  }

  goBackInHistory(): void {
    this.core.navigation.back();
  }
}
