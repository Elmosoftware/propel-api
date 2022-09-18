import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { CoreService } from 'src/services/core.service';
import { SystemHelper } from 'src/util/system-helper';
import { UsageStats } from '../../../../propel-shared/models/usage-stats';
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
    return this.core.security.isUserLoggedIn && Boolean(this.userStats);
  }

  constructor(private core: CoreService, private route: ActivatedRoute) {

  }

  ngOnInit(): void {
    this.core.setPageTitle(this.route.snapshot.data);
    this.refreshData()
    .catch(this.core.handleError)
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

  async refreshData(): Promise<void> {
    
    try {
      let stats: UsageStats[];

      this.loadingResults = true
      stats = await this.core.status.getApplicationUsageStats();
      if(stats.length > 0) this.stats = stats[0];
      if(stats.length > 1) this.userStats = stats[1];
      this.loadingResults = false;
      return Promise.resolve()

    } catch (error) {
      this.loadingResults = false;
      return Promise.reject(error);
    }
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
