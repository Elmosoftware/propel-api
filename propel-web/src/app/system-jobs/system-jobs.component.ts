import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';

import { SystemJob, SystemJobLogEntry, SystemJobLogs } from '../../../../propel-shared/core/system-job';
import { compareEntities } from '../../../../propel-shared/models/entity';
import { CoreService } from 'src/services/core.service';
import { APIStatus } from '../../../../propel-shared/models/api-status';

@Component({
  selector: 'app-system-jobs',
  templateUrl: './system-jobs.component.html',
  styleUrls: ['./system-jobs.component.css']
})
export class SystemJobsComponent implements OnInit {

  loading: boolean = true;
  allJobs: SystemJob[] = []
  apiStatus: APIStatus | null = null;
  selectedJob: SystemJob | null = null;
  selectedJobLogs: SystemJobLogs | null = null;
  showOnlyErrors: boolean = false;
  onlyErrorsLogs: SystemJobLogEntry[] = []

  /**
   * Used by the dropdowns to compare the values.
   */
  compareFn: Function = compareEntities;

  constructor(private core: CoreService, private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.core.setPageTitle(this.route.snapshot.data);

    this.refreshData()
    .then(() => {
      this.loading = false;
    })
    .catch((error) => {
      this.core.handleError(error)
    })
  }

  async refreshData(): Promise<void> {
    try {
      this.apiStatus = await this.core.status.getStatus();
      this.allJobs = await this.core.status.getSystemJobs();
      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async getSelectedJobLogs(jobName: string): Promise<void> {
    try {
      this.selectedJobLogs = await this.core.status.getSystemJobLogs(jobName);

      // /////////////////////////////////////////////////////////////
      // //DEBUG ONLY: SImulating having 2 errors:
      // if (this.selectedJobLogs) {
      //   this.selectedJobLogs.logs[0].isError = true
      //   this.selectedJobLogs.logs[1].isError = true
      //   this.selectedJobLogs.stats.errors =2
      // }
      // /////////////////////////////////////////////////////////////

      if (this.selectedJobLogs) {
        this.onlyErrorsLogs = this.selectedJobLogs.logs.filter((log: SystemJobLogEntry) => log.isError)
      }
      else {
        this.onlyErrorsLogs = []
      }
      
      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  }
  
  onJobChange($event: SystemJob) {
    this.selectedJob = $event;
    this.refreshJobLogs();
  }

  refreshJobLogs() {
    if (!this.selectedJob) return;

    this.getSelectedJobLogs(this.selectedJob.name)
    .catch((error) => {
      this.core.handleError(error)
    })
  }

  onFilterClick(showOnlyErrors: boolean) {
    this.showOnlyErrors = Boolean(showOnlyErrors);
  }

  getSelectedJobLogEntries(): SystemJobLogEntry[] {
    if (!this.selectedJobLogs) return []
    if (this.showOnlyErrors) return this.onlyErrorsLogs;
    else return this.selectedJobLogs.logs;
  }

  getSelectedJobCycle(): string {
    if(!this.selectedJob) return ""
    else return `Every ${this.selectedJob.every.toString()} ${this.selectedJob.unit}.`
  }

  getSelectedJobFirstRun(): string {
    if(!this.selectedJob) return ""

    if (this.selectedJob.runImmediately) return "As soon Propel API starts."
    else return `${this.selectedJob.every.toString()} ${this.selectedJob.unit} after Propel API starts.`
  }
}
