import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';

const MIN_RANGE: number = 0
const MAX_RANGE: number = 100;

@Component({
  selector: 'app-cool-spiner',
  templateUrl: './cool-spiner.component.html',
  styleUrls: ['./cool-spiner.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class CoolSpinerComponent implements OnInit {

  /**
   * The percentage to represent. This must be a value greater or equal than 0 and 
   * less or equal to 100.
   */
   @Input() percentage: string = "0";

   get rangeValue(): number {
      let val: number = MIN_RANGE

      if (isNaN(Number(this.percentage))) return val;
      val = parseInt(this.percentage);

      if (val < MIN_RANGE) return MIN_RANGE;
      if(val > MAX_RANGE) return MAX_RANGE;

      return val;
   }

  get rangeMode(): string {
    if (this.rangeValue == MAX_RANGE || this.rangeValue == MIN_RANGE) {
      return "determinate"
    }
    else {
      return "indeterminate"
    }
  }

  constructor() { }

  ngOnInit(): void {
  }

}
