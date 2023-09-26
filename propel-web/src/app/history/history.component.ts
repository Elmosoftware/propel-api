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
      }
    };
    qm.sortBy = "-startedAt";  
    
    try {
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
    let ret: string = "";

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
    
    this.workflowName = log.workflow.name;
    this.workflowNameTooltip = `${log.workflow.name}:\r\n${(log.workflow.description) ? log.workflow.description : "No description available."}`;
    
    this.duration = SharedSystemHelper.getDuration(log.startedAt, log.endedAt);
    this.durationTooltip = `Start at: ${SharedSystemHelper.formatDate(log.startedAt)}
End at: ${SharedSystemHelper.formatDate(log.endedAt)}
Total duration: ${SharedSystemHelper.getDuration(log.startedAt, log.endedAt)}.`

    this.stepsAmount = log.workflow.steps.length.toString();
    this.stepsAmountTooltip = `The workflow has defined ${log.workflow.steps.length} step${(log.workflow.steps.length > 1) ? "s" : ""}.`;

    //Building the targets set:
    log.workflow.steps.forEach((s) => {
      s.targets.map((t) => targets.add(t.friendlyName));      
    })

    this.targetsAmount = targets.size.toString();
    this.targetsAmountTooltip = `This workflow is hitting ${targets.size} target${(targets.size > 1) ? "s" : ""}:
${Array.from(targets).join("\r\n")}`;

    if (log.user?.fullName) {
      this.executedBy = log.user.fullName; 
    } 
    else {
      this.executedBy = "an Unknown user";
    }   
  }
}
