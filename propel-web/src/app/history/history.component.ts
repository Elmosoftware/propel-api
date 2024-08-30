import { Component, OnInit, EventEmitter } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { CoreService } from 'src/services/core.service';
import { QueryModifier } from '../../../../propel-shared/core/query-modifier';
import { UIHelper } from 'src/util/ui-helper';
import { InfiniteScrollingService, PagingHelper, SCROLL_POSITION } from 'src/core/infinite-scrolling-module';
import { ExecutionLog } from '../../../../propel-shared/models/execution-log';
import { SharedSystemHelper } from '../../../../propel-shared/utils/shared-system-helper';
import { DataEndpointActions } from 'src/services/data.service';
import { PagedResponse } from '../../../../propel-shared/core/paged-response';
import { ScheduleCalculator } from '../../../../propel-shared/core/schedule-calculator';
import { APIStatus } from '../../../../propel-shared/models/api-status';

export enum IntervalType {
  LastHalfHour = 30,
  LastHour = 60,
  LastDay = 1440, //(60 * 24)
  LastWeek = 10080, //(60 * 24 * 7)
  LastMonth = 43200 //(60 * 24 * 30)
}

/**
 * Size of each data page.
 */
const PAGE_SIZE: number = 50;

enum Tabs {
  Manual = 0,
  Scheduled = 1
}

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {

  private requestCount$!: EventEmitter<number>;

  intervalTypeEnum = IntervalType;
  fg!: UntypedFormGroup;
  svcInfScroll!: InfiniteScrollingService<ExecutionLogExtended>;
  onDataFeed!: EventEmitter<PagingHelper>;
  activeTab: Tabs = Tabs.Manual;
  apiStatus: APIStatus | null = null;
  showWarning: boolean = true;

  constructor(private core: CoreService, private route: ActivatedRoute) {

  }

  ngOnInit(): void {
    this.core.setPageTitle(this.route.snapshot.data);
    this._buildForm();

    this.requestCount$ = this.core.navigation.getHttpRequestCountSubscription()
    this.requestCount$
      .subscribe({
        next: (count: number) => {
          if (count > 0) {
            this.fg.disable({ emitEvent: false });
          }
          else {
            this.fg.enable({ emitEvent: false });
          }
        }
      })

    this.fg.controls['interval'].valueChanges
      .subscribe({
        next: (val) => {
          this.search();
        }
      })
  }

  hideWarning() {
    this.showWarning = false;
  }

  activeTabChanged($event: Tabs) {
    this.activeTab = $event
    this.search();
  }

  search() {
    this.resetSearch();
    this.fetchData(this.svcInfScroll.pageSize, 0)
    .catch((error) => {
      this.core.handleError(error)
    })
  }
  
  async fetchData(top: number, skip: number): Promise<void> {
    let qm = new QueryModifier();
    let paged: PagedResponse<ExecutionLog>;
    let xLog: ExecutionLogExtended[] 

    if (this.svcInfScroll.model) {
      this.core.toaster.showInformation("We are retrieving more data from your search. It will be available soon.", "Retrieving data");
    }

    qm.top = top;
    qm.skip = skip;
    qm.populate = true;

    qm.filterBy = {
      startedAt: {
        $gte: SharedSystemHelper.addMinutes(this.fg.controls['interval'].value * -1)
      },
      runOnSchedule: (this.activeTab == Tabs.Scheduled)
    };
    qm.sortBy = "-startedAt";  
    
    try {
      //Updating API status:
      this.apiStatus = await this.core.status.getStatus();
      paged = await this.core.data.find(DataEndpointActions.ExecutionLog, qm) as PagedResponse<ExecutionLog>;
      xLog = paged.data.map((l: ExecutionLog) => new ExecutionLogExtended(l))
      this.svcInfScroll.feed(paged.totalCount, xLog);

      if (this.svcInfScroll.count > 0) {
        this.core.toaster.showInformation(`Showing now ${this.svcInfScroll.count} results of a total of ${this.svcInfScroll.totalCount} coincidences found. 
          ${(this.svcInfScroll.totalCount > this.svcInfScroll.count) ? "Keep scrolling to see more." : ""}   `, "New results have been added.")
      }
      
      return Promise.resolve();
      
    } catch (error) {
      return Promise.reject(error)
    }
  }

  resetSearch() {
    this.svcInfScroll = new InfiniteScrollingService<ExecutionLogExtended>(PAGE_SIZE);
    this.onDataFeed = this.svcInfScroll.dataFeed;

    this.onDataFeed
      .subscribe({
        next: (ph: PagingHelper) => {
          this.onDataFeedHandler(ph)
        }
      }); 
  }

  getWorkflowName(item: ExecutionLogExtended): string {
    let ret: string = "Missing Workflow!";

    if (!item.log?.workflow) return ret;

    ret = item.log.workflow.name;

    if (item.log.workflow.isQuickTask) {
      ret = UIHelper.removeIDFromQuickTaskName(ret)
    }

    return ret;
  }

  getWorkflowNameTooltip(item: ExecutionLogExtended){ 
    return item.workflowNameTooltip + "\r\nClick here to edit this Workflow."
  }

  getTimeStamp(item: ExecutionLogExtended): string {
    return item.startDateFriendly + ((item.executedBy) ? " by " + item.executedBy : "");
  }

  getTimeStampTooltip(item: ExecutionLogExtended) {
    return item.startDate + ", Total duration:" + item.duration + ".";
  }

  onScrollEndHandler(e: SCROLL_POSITION): void {
    this.svcInfScroll.onScrollEndHandler(e);
  }

  onDataFeedHandler(ph: PagingHelper): void {
    this.fetchData(ph.top, ph.skip);
  }
  
  fullScrollUp() {
    this.svcInfScroll.fullScrollUp();
  }

  fullScrollDown() {
    this.svcInfScroll.fullScrollDown();
  }

  goToEditWorkflow(id: string) {
    this.core.navigation.toWorkflow(id);
  }

  goToResults(id: string) {
    this.core.navigation.toResults(id);
  }

  private _buildForm(): void {
    this.fg = new UntypedFormGroup({
      interval: new UntypedFormControl()
    });
  }
}

export class ExecutionLogExtended {

  log: ExecutionLog
  startDate: string;
  startDateFriendly: string;
  workflowName: string;
  workflowNameTooltip: string;
  hasActiveSchedule: boolean;
  scheduleDescription: string;
  scheduleTooltip: string;
  duration: string;
  durationTooltip: string;
  stepsAmount: string;
  stepsAmountTooltip: string;
  targetsAmount: string;
  targetsAmountTooltip: string; 
  executedBy: string;

  constructor(log: ExecutionLog) {

    let targets: Set<string> = new Set<string>();

    this.log = log;
    
    this.startDate = SharedSystemHelper.formatDate(log.startedAt);
    this.startDateFriendly = SharedSystemHelper.getFriendlyTimeFromNow(log.startedAt);
    
    this.duration = SharedSystemHelper.getDuration(log.startedAt, log.endedAt);
    this.durationTooltip = `Start at: ${SharedSystemHelper.formatDate(log.startedAt)}
End at: ${SharedSystemHelper.formatDate(log.endedAt)}
Total duration: ${SharedSystemHelper.getDuration(log.startedAt, log.endedAt)}.`

    if (log.workflow) {
      this.workflowName = log.workflow.name;
      this.workflowNameTooltip = `${log.workflow.name}:\r\n${(log.workflow.description) ? log.workflow.description : "No description available."}`;
      
  
      this.stepsAmount = log.workflow.steps.length.toString();
      this.stepsAmountTooltip = `The workflow has defined ${log.workflow.steps.length} step${(log.workflow.steps.length > 1) ? "s" : ""}.`;
  
      //Building the targets set:
      log.workflow.steps.forEach((s) => {
        s.targets.map((t) => targets.add(t.friendlyName));      
      })

      this.hasActiveSchedule = log.workflow.schedule.enabled;        
      this.scheduleDescription = ScheduleCalculator.getDescription(log.workflow.schedule)
      this.scheduleTooltip = ""

      if (this.hasActiveSchedule) {
        let nextExec = ScheduleCalculator.getNextRun(log.workflow.schedule)

        this.scheduleTooltip = "Last execution:";
        this.scheduleTooltip += (log.workflow.schedule.lastExecution) ? 
          SharedSystemHelper.formatDate(log.workflow.schedule.lastExecution!)  : "None."
        this.scheduleTooltip += "\r\nNext execution:"
        this.scheduleTooltip += (nextExec) ? SharedSystemHelper.formatDate(nextExec) : "Never."
      }
    }
    else {
      this.workflowName = "Missing Workflow";
      this.workflowNameTooltip = `There is no a valid Workflow reference for this Execution. Check the execution errors for more details.`;
      this.stepsAmount = "0";
      this.stepsAmountTooltip = ``;
      this.hasActiveSchedule = false;        
      this.scheduleDescription = "";
      this.scheduleTooltip = "";
    }

    this.targetsAmount = targets.size.toString();
    this.targetsAmountTooltip = `This workflow is hitting ${targets.size} target${(targets.size > 1) ? "s" : ""}:
${Array.from(targets).join("\r\n")}`;

    if (log.user?.fullName) {
      this.executedBy = log.user.fullName; 
    } 
    else if(log.runOnSchedule) {
      this.executedBy = "SYSTEM";
    }
    else {
      this.executedBy = "an Unknown user";
    }   
  }
}
