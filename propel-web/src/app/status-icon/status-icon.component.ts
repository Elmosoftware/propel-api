import { Component, OnInit, Input } from '@angular/core';

export enum IconSizes {
  Small = "small",
  Big = "big"
}

export enum IconStyle {
  Light = "light",
  Dark = "dark"
}

@Component({
  selector: 'app-status-icon',
  templateUrl: './status-icon.component.html',
  styleUrls: ['./status-icon.component.css']
})
export class StatusIconComponent implements OnInit {

  /**
   * Status the icon must represent.
   */
  @Input() status: string;

  /**
   * A tooltip text that helps the user to clarify the symbolism.
   */
  @Input() tooltipText: string;

  /**
   * Icon style. It change the icon representation to match better the background.
   */
  @Input() iconStyle: string = IconStyle.Light;

  /**
   * Tooltip text positioning, you can choose between:
   * 'after', 'before', 'above', 'below', 'left', 'right'
   * If not specified the tooltip will be displayed over the icon.
   */
  @Input() tooltipPosition: string = "above";

  /**
   * Size of the icon.
   */
  @Input() size: IconSizes = IconSizes.Small;


  get tooltip(): string {

    let ret = "";

    switch (this.status) {
      case "RUNNING":
        ret = "Running."
        break;
      case "PENDING":
      case "NOTSTARTED":
        ret = "Not started yet."
        break;
      case "FAULTY":
      case "FAILED":
        ret = "One or more errors occurred."
        break;
      case "SUCCESS":
        ret = "Finished successfully!"
        break;
      case "CANCELLED":   
      case "ABORTED":
        ret = "Canceled by user."
        break;
      case "SKIPPED":
        ret = "Skipped."
        break;    
    }

    if (this.tooltipText) {
      ret = this.tooltipText + `: ${ret}`
    }

    return ret;
  }

  constructor() { }

  ngOnInit(): void {
  }

}
