import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DialogResult } from 'src/core/dialog-result';

import { CoreService } from 'src/services/core.service';
import { CredentialTypes } from '../../../../propel-shared/models/credential-types';
import { StandardDialogConfiguration } from '../dialogs/standard-dialog/standard-dlg.component';

@Component({
  selector: 'app-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.css']
})
export class NavigationBarComponent implements OnInit {

  constructor(private core: CoreService, private route: ActivatedRoute) {
  }

  loading: boolean;
  searchTerm: string = "";

  get isBrowsePage(): boolean {
    return this.core.navigation.currentPage.name.startsWith(this.core.navigation.browsePagePrefix);
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

  get userName(): string {
    let ret:string = "";

    if (this.core.session.IsUserLoggedIn) {
      ret = `${this.core.session.sessionData.userFullName}, (${this.core.session.sessionData.userName})`
    }

    return ret;
  }

  get userInitials(): string {
    let ret:string = "";

    if (this.userName) {
      ret = this.core.session.sessionData.userInitials;
    }

    return ret;
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
      .subscribe((counter: number) => {
        this.loading = counter > 0;
      })
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
    this.core.navigation.toNewCredential(CredentialTypes.Windows);
  }

  goToCredentialAWS() {
    this.core.navigation.toNewCredential(CredentialTypes.AWS);
  }

  goToCredentialGenericAPIKey() {
    this.core.navigation.toNewCredential(CredentialTypes.APIKey);
  }

  goToUserAccount() {
    this.core.navigation.toUserAccount();
  }

  goToLogin() {
    this.core.navigation.toLogin();
  }

  goToLogoff() {
    this.core.dialog.showConfirmDialog(new StandardDialogConfiguration(
      "Log off",
      `Are you sure you want to log off?`, "Yes, I want!", "No, I'll stay here a little longer")
    ).subscribe((result: DialogResult<any>) => {
      if (!result.isCancel) {
        this.core.security.logOff();
        this.core.navigation.toHome();
      }
    }, err => {
      throw err
    });
  }

  doNotPropagate($event) {
    $event.stopPropagation();
  }
}
