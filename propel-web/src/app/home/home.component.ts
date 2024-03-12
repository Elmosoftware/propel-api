import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { CoreService } from 'src/services/core.service';
import { SharedSystemHelper } from '../../../../propel-shared/utils/shared-system-helper';
import { UsageStats } from '../../../../propel-shared/models/usage-stats';
import { UIHelper } from 'src/util/ui-helper';
import { environment } from 'src/environments/environment';
import { GraphSeriesData } from '../../../../propel-shared/models/graph-series-data';
import { SecurityEvent } from 'src/services/security.service';
import { Subscription } from 'rxjs';
import { logger } from '../../../../propel-shared/services/logger-service';
import { SecuritySharedConfiguration } from '../../../../propel-shared/core/security-shared-config';

const TOP_RESULTS: number = 5;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

  loadingResults: boolean = false;
  stats!: UsageStats;
  userStats: UsageStats | undefined = undefined;
  graphColors: any = environment.graphs.colorScheme;
  graphExecutionsView: any[] = [650, 200];
  securityEventSubscription$!: Subscription;

  constructor(private core: CoreService, private route: ActivatedRoute) {

  }

  ngOnInit(): void {
    this.core.setPageTitle(this.route.snapshot.data);
    this.refreshData()
      .catch((error) => {
        this.core.handleError(error)
      })

    this.securityEventSubscription$ = this.core.security.getSecurityEventSubscription()
      .subscribe({
        next: async (event: SecurityEvent) => {
          let action: string = "";
          try {
            if (event == SecurityEvent.Login) {
              action = "Updated user stats in Home page."
              this.userStats = await this.getUserStats();
            }
            else {
              action = "Clearing user stats in Home page."
              this.userStats = undefined;
            }
          } catch (error) {
            action = `None, Error received when trying to update user stats: "${String(error)}".`
          }

          logger.logInfo(`Received Security event "${(event == SecurityEvent.Login) ? "Login" : "Logoff"}". Action taken: ${action}`)
        }
      })
  }

  ngOnDestroy(): void {
    try {
      this.securityEventSubscription$.unsubscribe();
    }
    catch (e) {
    }
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

  goToCredentialDatabase() {
    this.core.navigation.toDatabaseCredential();
  }

  async getUserStats(): Promise<UsageStats | undefined>{

    if (!this.core.security.isUserLoggedIn) return Promise.resolve(undefined);

    let cfg: SecuritySharedConfiguration = await this.core.security.getConfig();

    if (cfg.legacySecurity) return Promise.resolve(undefined);

    return await this.core.status.getUserStats();
  }

  async refreshData(): Promise<void> {
    try {
      this.loadingResults = true
      this.stats = await this.core.status.getApplicationUsageStats();

      //If there is a user logged in and we don't get his stats yet:
      if (this.core.security.isUserLoggedIn && !this.userStats) {
        this.userStats = await this.getUserStats();
      }

      this.loadingResults = false;
      return Promise.resolve()

    } catch (error) {
      this.loadingResults = false;
      logger.logError(`There was an error updating stats: "${String(error)}".`)
      return Promise.reject(error);
    }
  }

  getLatestActivityText(item: GraphSeriesData) {
    return `${this.getFriendlyStartTime(item.lastTimeUpdated)}${(item?.extra?.userFullName) ? " by " + String(item.extra.userFullName) : ""}`
  }

  getFriendlyStartTime(startTime: Date | undefined): string {
    if (!startTime) return ""
    else return SharedSystemHelper.getFriendlyTimeFromNow(startTime);
  }

  getShortErrorText(text: string): string {
    return UIHelper.getShortText(text, 0, 75);
  }

  onSelectChart($event: any) {
    this.goToHistory();
  }
}
