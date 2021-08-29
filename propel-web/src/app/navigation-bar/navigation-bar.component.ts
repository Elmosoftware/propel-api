import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { CoreService } from 'src/services/core.service';
import { SearchType } from '../search/search.component';
import { PAGES } from 'src/services/navigation.service';
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

  get isSearchPage(): boolean {
    return this.core.navigation.currentPage().startsWith(this.core.navigation.browsePagePrefix);
  }
  
  get isOffline(): boolean {
    return this.core.navigation.currentPage() == PAGES.Offline;
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

  goToSearch(){
    if (this.searchTerm.length < 3)  return;
    // this.core.navigation.toSearch(SearchType.Workflows, this.searchTerm);
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

  goToHistory() {
    this.core.navigation.toHistory();
  }

  goToCredentialWin() {
    this.core.navigation.toCredential(null, CredentialTypes.Windows);
  }

  goToCredentialAWS() {
    this.core.navigation.toCredential(null, CredentialTypes.AWS);
  }
}
