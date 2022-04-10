import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { CoreService } from 'src/services/core.service';
import { CredentialTypes } from '../../../../propel-shared/models/credential-types';

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
    // return PAGES.QuickTask == this.core.navigation.currentPage();
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
    // this.core.navigation.toCredential(null, CredentialTypes.Windows);
    this.core.navigation.toNewCredential(CredentialTypes.Windows);
  }

  goToCredentialAWS() {
    // this.core.navigation.toCredential(null, CredentialTypes.AWS);
    this.core.navigation.toNewCredential(CredentialTypes.AWS);
  }

  goToCredentialGenericAPIKey() {
    // this.core.navigation.toCredential(null, CredentialTypes.APIKey);
    this.core.navigation.toNewCredential(CredentialTypes.APIKey);
  }

  goToUserAccount() {
    this.core.navigation.toUserAccount();
  }

  doNotPropagate($event) {
    $event.stopPropagation();
  }
}
