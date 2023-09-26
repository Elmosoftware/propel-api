import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DialogResult } from 'src/core/dialog-result';
import { CoreService } from 'src/services/core.service';
import { WebsocketMessage, InvocationStatus, ExecutionStats } from "../../../../propel-shared/core/websocket-message";
import { ExecutionStatus } from '../../../../propel-shared/models/execution-status';
import { Utils } from '../../../../propel-shared/utils/utils';
import { StandardDialogConfiguration } from '../dialogs/standard-dialog/standard-dlg.component';
import { Workflow } from '../../../../propel-shared/models/workflow';
import { DataEndpointActions } from 'src/services/data.service';
import { WorkflowStep } from '../../../../propel-shared/models/workflow-step';
import { WorkflowStepComponentStatus } from '../workflow-step/workflow-step.component';
import { RuntimeParameters } from '../../../../propel-shared/models/runtime-parameters';
import { ParameterValue } from '../../../../propel-shared/models/parameter-value';
import { RunnerServiceData } from '../../../../propel-shared/core/runner-service-data';

@Component({
  selector: 'app-run',
  templateUrl: './run.component.html',
  styleUrls: ['./run.component.css']
})
export class RunComponent implements OnInit {

  model!: WebsocketMessage<ExecutionStats>[];
  workflow!: Workflow;
  workflowStatus: string = InvocationStatus.NotStarted;
  stepStatus: Map<number, WorkflowStepComponentStatus> = new Map<number, WorkflowStepComponentStatus>();
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

    if (this.workflowStatus == InvocationStatus.NotStarted || 
      this.workflowStatus == InvocationStatus.Editing ||
      this.workflowStatus == InvocationStatus.Preparing) return ret;

    if (this.hasMessages && this.workflowStatus == InvocationStatus.Running) {
      if (this.workflowStatus == InvocationStatus.Running && this.currentContext.currentStep > 0) {
        ret = `"${this.currentStepName}" (${this.currentContext.currentStep} of ${this.currentContext.totalSteps}).`
      }
      else if (this.workflowStatus !== InvocationStatus.Running) {
        ret = `Execution has ended with status "${Utils.capitalize(String(this.workflowStatus).toLowerCase())}".`
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
            this.editRuntimeParameters();
          }
        },
        error: err => {
          this.core.handleError(err)
        }
      });
    }
    else {
      this.editRuntimeParameters();
    }
  }

  editRuntimeParameters() {
    let workflowId: string = this.route.snapshot.paramMap.get("id") ?? "";
    this.pushMessageToUI(InvocationStatus.NotStarted, "Checking workflow status.....")
    this.workflowStatus = InvocationStatus.NotStarted;

    this.core.data.getById<Workflow>(DataEndpointActions.Workflow, workflowId, true)
    .then((workflow: Workflow | undefined) => {
      let hasRPs: boolean = false;

      if (!workflow) {
        this.workflowStatus = InvocationStatus.Failed;
        this.pushMessageToUI(InvocationStatus.Failed, "There was an error retrieving the Workflow details", 
          "The requested Workflow/Quick Task is not available, please check if already exists before to retry.")
        return;
      }

      this.workflow = workflow;

      //If the workflow has at least one runtime parameter:
      this.workflow.steps.forEach((step) => {
          hasRPs = this.stepHasRuntimeParameters(step) || hasRPs;
      })

      if (hasRPs) {
        this.pushMessageToUI(InvocationStatus.Editing, "This workflow has some runtime parameters defined.")
        this.workflowStatus = InvocationStatus.Editing;
      }
      else {
        //If there is no runtime paramters to set, we can start the workflow execution:
        this.startExecution()
      }      
    })
    .catch((err) => {
      this.workflowStatus = InvocationStatus.Failed;
      this.pushMessageToUI(InvocationStatus.Failed, "There was an error retrieving the Workflow details", 
        "Please retry this operation later.")
      throw err
    })    
  }

  extractRuntimeParameters(step: WorkflowStep): ParameterValue[] {
    return step.values.filter((value) => value.isRuntimeParameter);
  }  

  stepHasRuntimeParameters(step: WorkflowStep): boolean {
      return (this.extractRuntimeParameters(step).length > 0);
  } 

  stepChange(status: WorkflowStepComponentStatus, stepIndex: number) {
    if (status instanceof WorkflowStepComponentStatus) {
      this.stepStatus.set(stepIndex, status)
    }    
  }

  isStepValid(stepIndex: number): boolean {
    let status =  this.stepStatus.get(stepIndex);

    if (status) return status.isValid;
    return false;
  }

  areAllStepsValid(): boolean {
    let hasInvalids: boolean = false;

    this.stepStatus.forEach((status) => {
      if (!status.isValid) hasInvalids = true;
    })

    return !hasInvalids
  }

  isStepValidTooltipText(stepIndex: number): string {
    if (this.isStepValid(stepIndex)) return "Data seems to be valid for this step."
    return "Some of the data entered for this step is not valid, please check..."
  }

  cancelEditing() {
    if (this.workflowStatus == InvocationStatus.Editing) {
      this.core.dialog.showConfirmDialog(new StandardDialogConfiguration(
        "Cancelling Workflow execution", `Please confirm you would like to cancel the execution of workflow "${this.workflow.name}".`)
      ).subscribe({
        next: (result: DialogResult<any>) => {
          if (result.isCancel) return
          this.pushMessageToUI(InvocationStatus.UserActionCancel, "The execution was cancelled by the user.", "The execution was cancelled by the user.")
          this.workflowStatus = InvocationStatus.UserActionCancel;
        },
        error: err => {
          this.core.handleError(err)
        }
      });
    }
  }

  runWorkflow() {
    if (this.workflowStatus == InvocationStatus.Editing) {
      this.core.dialog.showConfirmDialog(new StandardDialogConfiguration(
        "Confirm Workflow execution", `Please confirm workflow "${this.workflow.name}" execution.`)
      ).subscribe({
        next: (result: DialogResult<any>) => {
          if (result.isCancel) return
          this.startExecution()
        },
        error: err => {
          this.core.handleError(err)
        }
      });
    }
  }

  startExecution() {
    let rps: RuntimeParameters[] = []

    this.core.toaster.showInformation("Starting execution ...");
    this.pushMessageToUI(InvocationStatus.NotStarted, "Starting... please wait.")
    this.workflowStatus = InvocationStatus.Running;

    //Replacing the history entry to ensure to request confirmation to the user when 
    //navigates back:
    this.core.navigation.replaceHistory(this.workflow._id, { conf: "true" })

    //Checking if there is some edited runtime parameters:
    if (this.stepStatus.size > 0) {
      this.stepStatus.forEach((status, stepIndex) => {
        rps.push({
          stepIndex: stepIndex,
          values: this.extractRuntimeParameters(status.step!)
        })
      })
    }

    this.core.runner.execute(new RunnerServiceData(this.workflow._id, rps))
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
