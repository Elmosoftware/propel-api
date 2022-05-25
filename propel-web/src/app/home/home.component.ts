import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { CoreService } from 'src/services/core.service';
import { APIResponse } from '../../../../propel-shared/core/api-response';
import { SystemHelper } from 'src/util/system-helper';
import { UsageStats } from '../../../../propel-shared/models/usage-stats';
import { CredentialTypes } from '../../../../propel-shared/models/credential-types';
import { UIHelper } from 'src/util/ui-helper';
import { environment } from 'src/environments/environment';
import { GraphSeriesData } from '../../../../propel-shared/models/graph-series-data';

const TOP_RESULTS: number = 5;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  loadingResults: boolean = false;
  stats: UsageStats;
  userStats: UsageStats;
  graphColors: any = environment.graphs.colorScheme;
  graphExecutionsView: any[] = [650, 200];

  get hasUserStats(): boolean {
    return this.core.session.IsUserLoggedIn && Boolean(this.userStats);
  }

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
    this.core.navigation.toWindowsCredential();
  }

  goToCredentialAWS() {
    this.core.navigation.toAWSCredential();
  }

  goToCredentialGenericAPIKey() {
    this.core.navigation.toGenericAPIKeyCredential();
  }

  refreshData(): void {
    this.loadingResults = true

    this.core.status.getApplicationUsageStats()
      .subscribe((results: APIResponse<UsageStats>) => {
            if (results.count > 0) {
              this.stats = results.data[0];

              if(results.count == 2) {
                this.userStats = results.data[1];
              }

              this.loadingResults = false;
            }            
          },
            err => {
              this.loadingResults = false;
              throw err
            });
  }

  getLatestActivityText(item: GraphSeriesData) {
    return `${this.getFriendlyStartTime(item.lastTimeUpdated)}${(item?.extra?.userFullName) ? " by " + String(item.extra.userFullName) : ""}`
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
