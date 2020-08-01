import { Component, OnInit, Input } from '@angular/core';
import { ScriptParameter } from '../../../../propel-shared/models/script-parameter';

@Component({
  selector: 'app-script-parameters',
  templateUrl: './script-parameters.component.html',
  styleUrls: ['./script-parameters.component.css']
})
export class ScriptParametersComponent implements OnInit {

  @Input() parameters: ScriptParameter[];

  constructor() { }

  ngOnInit(): void {
  }

  getOptions(param: ScriptParameter): string {
    let ret: string = "";

    ret = `${(param.required) ? "Required" : "Optional"}, ${(param.canBeNull) ? "Can be null" : "Can't be null"}, ${(param.canBeEmpty) ? "Can be empty" : "Can't be empty"}, ${(param.validValues && param.validValues.length > 0) ? "Valid set defined" : "No valid set defined"}.`;
    return ret;
  }
}
