import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { CoreService } from 'src/services/core.service';
import { QueryModifier } from '../../../../propel-shared/core/query-modifier';
import { ExecutionLog } from '../../../../propel-shared/models/execution-log';
import { APIResponse } from '../../../../propel-shared/core/api-response';
import { SystemHelper } from 'src/util/system-helper';
import { Workflow } from '../../../../propel-shared/models/workflow';
import { Script } from '../../../../propel-shared/models/script';
import { Target } from '../../../../propel-shared/models/target';

const TOP_RESULTS: number = 5;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  lastResults: ExecutionLog[] = [];
  totalResults: number = -1;
  totalWorkflows: number = -1;
  totalScripts: number = -1;
  totalTargets: number = -1;

  constructor(private core: CoreService, private route: ActivatedRoute) { }

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

  refreshData(): void {
    this.refreshLastLogs();
    this.refreshTotalWorkflows();
    this.refreshTotalScripts();
    this.refreshTotalTargets();
  }

  refreshLastLogs() {
    let qm = new QueryModifier();

    qm.top = TOP_RESULTS;
    qm.skip = 0;
    qm.populate = true;
    qm.sortBy = "-startedAt";

    this.core.data.find(ExecutionLog, qm)
      .subscribe((results: APIResponse<ExecutionLog>) => {
        this.lastResults = results.data;
        this.totalResults = results.totalCount;
      },
        err => {
          throw err
        });
  }

  refreshTotalWorkflows() {
    let qm = new QueryModifier();

    qm.top = 1;
    qm.skip = 0;
    qm.populate = false;
    qm.filterBy = {
      isQuickTask: { $eq: false}
    }

    this.core.data.find(Workflow, qm)
      .subscribe((results: APIResponse<Workflow>) => {
        this.totalWorkflows = results.totalCount;
      },
        err => {
          throw err
        });
  }

  refreshTotalScripts() {
    let qm = new QueryModifier();

    qm.top = 1;
    qm.skip = 0;
    qm.populate = false;
    
    this.core.data.find(Script, qm)
      .subscribe((results: APIResponse<Script>) => {
        this.totalScripts = results.totalCount;
      },
        err => {
          throw err
        });
  }

  refreshTotalTargets() {
    let qm = new QueryModifier();

    qm.top = 1;
    qm.skip = 0;
    qm.populate = false;
    
    this.core.data.find(Target, qm)
      .subscribe((results: APIResponse<Target>) => {
        this.totalTargets = results.totalCount;
      },
        err => {
          throw err
        });
  }

  getFriendlyStartTime(log: ExecutionLog): string {
    return SystemHelper.getFriendlyTimeFromNow(log.startedAt);
  }
}
