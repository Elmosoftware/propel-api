import { Component, OnInit, Input } from '@angular/core';
import { ExecutionStats, WebsocketMessage, InvocationStatus } from '../../../../propel-shared/core/websocket-message';

@Component({
  selector: 'app-console-line',
  templateUrl: './console-line.component.html',
  styleUrls: ['./console-line.component.css']
})
export class ConsoleLineComponent implements OnInit {

  private sepSexa: string = ":";
  private sepDec: string = ".";  

  @Input() model: WebsocketMessage<ExecutionStats>;
  isControlMsg: boolean = true;
  isErrorMsg: boolean = false;
  message: string = "";

  constructor() { }
  
  ngOnInit(): void {
    this.message = this.getMessageFromModel();
  }

  getMessageFromModel(): string {
    let ret: string = "";
    let showFrom: boolean = false;

    if (!this.model) return ret;
    
    ret = this.model.message;

    switch (this.model.status) {
      case InvocationStatus.Preparing:
        ret = `Preparing step #${String(this.model.context.currentStep).padStart(2, "0")} "${this.model.context.steps[this.model.context.currentStep - 1].stepName}"...`;
        break;
      case InvocationStatus.Running:
        if (!ret) {
          ret = `Script execution is in progress ...`
        }
        else {
          showFrom = true;
          this.isControlMsg = false
        }        
        break;
      case InvocationStatus.Stopping:
        ret = `Script execution is ending ...`
        break;
      case InvocationStatus.Stopped:
        ret = `Script execution is over.`
        break;
      case InvocationStatus.Failed:
        ret = `[ERROR]: ${this.model.message}`
        this.isErrorMsg = true;
        showFrom = true;
        break;
      case InvocationStatus.Disposed:
        ret = "Execution has been canceled by user request."
        break;    
      case InvocationStatus.Finished:
        ret = "Finished!"
        break;
      default:
        break;
    }

    if (ret) {
      ret = `${this.timestampToString(this.model.timestamp)} ${(showFrom) ? "from ".concat(this.model.source.toUpperCase()) : ""} - ${ret}`;      
    }

    return ret;
  }

  private timestampToString(timestamp: Date): string {
    let t: Date;
    let ret = ""

    if(!timestamp) return ret;

    t = new Date(timestamp);

    ret = ret.concat(
      t.getHours().toString().padStart(2, "0"),
      this.sepSexa,
      t.getMinutes().toString().padStart(2, "0"),
      this.sepSexa,
      t.getSeconds().toString().padStart(2, "0"),
      this.sepDec,
      t.getMilliseconds().toString().padStart(3, "0"))

    return ret;      
  }
}
