import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DialogResult } from 'src/core/dialog-result';
import { CoreService } from 'src/services/core.service';
import { WebsocketMessage, InvocationStatus, ExecutionStats } from "../../../../propel-shared/core/websocket-message";
import { ExecutionStatus } from '../../../../propel-shared/models/execution-status';
import { Utils } from '../../../../propel-shared/utils/utils';
import { StandardDialogConfiguration } from '../dialogs/standard-dialog/standard-dlg.component';

@Component({
  selector: 'app-run',
  templateUrl: './run.component.html',
  styleUrls: ['./run.component.css']
})
export class RunComponent implements OnInit {

  model!: WebsocketMessage<ExecutionStats>[];
  workflowStatus: string = InvocationStatus.NotStarted;
  cancelling: boolean = false;
  aborting: boolean = false;
  confirmationRequired: boolean = false;

  @ViewChild("container", { static: false }) container!: ElementRef;

  constructor(private core: CoreService, private route: ActivatedRoute) {

  }

  get hasMessages(): boolean {
    return Boolean(this.model && this.model.length > 0);
  }

  get currentContext(): ExecutionStats {
    let ret: ExecutionStats;

    if (this.hasMessages && this.model[this.model.length - 1].context !== undefined) {
      ret = this.model[this.model.length - 1].context!;
    }
    else {
      ret = new ExecutionStats();
    }
    
    return ret;
  }

  get executionPercentage(): number {
    if (this.currentContext.totalSteps == 0) return 0
    if (this.currentContext.logId) return 100 //If we have a logId, means the execution is done!
    return Math.trunc(Math.abs(((this.currentContext.currentStep - 1)/this.currentContext.totalSteps)*100))
  }

  get currentStepName(): string {
    let ret = "";

    if (this.currentContext.currentStep) {
      ret = this.currentContext.steps[this.currentContext.currentStep - 1].stepName;
    }

    return ret;
  }

  get lastMessage(): WebsocketMessage<ExecutionStats> | undefined {
    if (this.hasMessages) return this.model[this.model.length - 1];
    else return undefined;
  }

  get statusMessage(): string {
    let ret: string = "";

    if (this.hasMessages) {
      if (this.workflowStatus == InvocationStatus.Running && this.currentContext.currentStep > 0) {
        ret = `"${this.currentStepName}" (${this.currentContext.currentStep} of ${this.currentContext.totalSteps}).`
      }
      else if (this.workflowStatus !== InvocationStatus.Running) {
        ret = `Execution has ended with status "${Utils.capitalize(this.workflowStatus.toLowerCase())}".`
      }
    }

    return ret;
  }

  ngOnInit(): void {
    this.core.setPageTitle(this.route.snapshot.data);
    this.model = [];

    this.confirmationRequired = (this.route.snapshot.queryParamMap.get("conf") ?? "")
      .toLowerCase() == "true" ? true : false;

    if (this.confirmationRequired) {
      this.pushMessageToUI(InvocationStatus.NotStarted, "Waiting for user confirmation...")
      this.core.dialog.showConfirmDialog(new StandardDialogConfiguration(
        "", `Please confirm workflow execution.`)
      ).subscribe({
        next: (result: DialogResult<any>) => {
          if (result.isCancel) {
            this.pushMessageToUI(InvocationStatus.UserActionCancel, "The execution was cancelled by the user.")
          }
          else {
            this.startExecution();
          }
        },
        error: err => {
          this.core.handleError(err)
        }
      });
    }
    else {
      this.startExecution();
    }
  }

  startExecution() {
    this.core.toaster.showInformation("Starting execution ...");
    this.pushMessageToUI(InvocationStatus.NotStarted, "Starting... please wait.")
    this.workflowStatus = InvocationStatus.Running;
    let workflowId: string = this.route.snapshot.paramMap.get("id") ?? "";

    //Replacing the history entry to ensure to request confirmation to the user when 
    //navigates back:
    this.core.navigation.replaceHistory(workflowId, { conf: "true" })

    this.core.runner.execute(workflowId)
      .subscribe({
        next: (msg: WebsocketMessage<ExecutionStats>) => {
          this.model.push(msg);
          this.scrollDown()
        },
        error: (err) => {
          this.processError(err);
        },
        complete: () => {
          this.workflowStatus = this.lastMessage?.context?.logStatus ?? "";
          this.scrollDown();

          let logId: string = this.lastMessage?.context?.logId ?? ""

          if (logId) {
            this.core.toaster.showInformation("Showing results soon...", "Execution is done.")
            setTimeout(() => {
              this.core.navigation.toResults(logId);
            }, 500);
          }
          else { //If there is no logId, means something prevent the execution to complete:
            this.core.toaster.showError("There was an error preventing the execution to complete.")
          }
        }
      }
      );
  }

  cancel(kill: boolean) {
    this.cancelling = !kill;
    this.aborting = kill;
    this.core.toaster.showInformation((kill) ? "Execution will be stopped immediately." :
      "Execution will be stopped as soon current step ends.", "Cancelling execution ...");
    this.core.runner.cancel(kill);
  }

  scrollDown() {
    if (this.container && this.container.nativeElement) {
      this.container.nativeElement.scrollTop = this.container.nativeElement.scrollHeight;
    }
  }

  processError(err: any): void {
    let msg: string = `There was an error trying to connect with the Propel API in order to start the workflow execution.
Please verify the service status and retry this operation later.`
    let title: string = "Connectivity issue prevent to start."

    //Means the connection was established but then closed unexpectedly:
    if (err instanceof CloseEvent) {
      msg = `Connectivity was interrupted. This can be caused by the Propel API service being shutdown.
Please check on the execution history log to get details about the workflow execution outcomes.
Websockets Error code: ${(err && err.code) ? String(err.code) : "unknown"}.`
      title = "";
    }

    this.workflowStatus = InvocationStatus.Failed;
    this.pushMessageToUI(InvocationStatus.Failed, title, msg);

    //We also need to change manually the status of the active step that was running at the time
    //the error occurred:
    this.currentContext.steps.forEach((step) => {
      if (step.status == ExecutionStatus.Running) {
        step.status = ExecutionStatus.Faulty;
      }
    })
    this.core.handleError(err)
  }

  pushMessageToUI(status: InvocationStatus, title: string = "", message: string = "",): void {
    let m: WebsocketMessage<ExecutionStats> = new WebsocketMessage(status, message,
      new ExecutionStats());

    if (title) {
      m.context!.workflowName = title //We will use this to display a custom message.
    }
    else {
      m.context = this.currentContext;
    }

    this.model.push(m);
  }
}
