import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { CoreService } from 'src/services/core.service';
import { APIResponse } from '../../../../propel-shared/core/api-response';
import { SystemHelper } from 'src/util/system-helper';
import { UsageStats } from '../../../../propel-shared/models/usage-stats';
import { CredentialTypes } from '../../../../propel-shared/models/credential-types';
import { UIHelper } from 'src/util/ui-helper';
import { environment } from 'src/environments/environment';

const TOP_RESULTS: number = 5;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  loadingResults: boolean = false;
  stats: UsageStats;
  graphColors: any = environment.graphs.colorScheme;
  graphExecutionsView: any[] = [650, 200];

  constructor(private core: CoreService, private route: ActivatedRoute) {

  }

  ngOnInit(): void {
    this.core.setPageTitle(this.route.snapshot.data);
    this.refreshData();
  }

  goToResults(id: string) {
    this.core.navigation.toResults(id);
  }

  goToHistory() {
    this.core.navigation.toHistory();
  }

  goToTarget() {
    this.core.navigation.toTarget();
  }

  goToScript() {
    this.core.navigation.toScript();
  }

  goToWorkflow() {
    this.core.navigation.toWorkflow();
  }

  goToQuickTask() {
    this.core.navigation.toQuickTask();
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

  run(id: string) {
    this.core.navigation.toRun(id);
  }

  goToEditWorkflow(id: string) {
    this.core.navigation.toWorkflow(id);
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

  refreshData(): void {
    this.loadingResults = true

    this.core.status.getApplicationUsageStats()
      .subscribe((results: APIResponse<UsageStats>) => {
            if (results.count > 0) {
              this.stats = results.data[0];
              this.loadingResults = false;
            }            
          },
            err => {
              this.loadingResults = false;
              throw err
            });
  }

  getFriendlyStartTime(startTime: Date): string {
    return SystemHelper.getFriendlyTimeFromNow(startTime);
  }

  getShortErrorText(text: string) : string {
    return UIHelper.getShortText(text, 0, 75);
  }
  
  onSelectChart($event) {
    this.goToHistory();
  }
}
