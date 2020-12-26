import { Component, OnInit, Input } from '@angular/core';
import { Target } from '../../../../propel-shared/models/target';
import { CoreService } from 'src/services/core.service';

@Component({
  selector: 'app-search-target-line',
  templateUrl: './search-target-line.component.html',
  styleUrls: ['./search-target-line.component.css']
})
export class SearchTargetLineComponent implements OnInit {

  @Input() model: Target[];

  constructor(private core: CoreService) {

  }

  ngOnInit(): void {
  }

  goToEditTarget(id: string) {
    this.core.navigation.toTarget(id);
  }

  getTargetTooltipMessage(item: Target): string {
    let ret = `This target is enabled and ready to use.`;

    if(!item.enabled) {
      ret = `This target is now disabled. It can't be selected as a target for any Workflow. 
If there is a Workflow that already have it, the execution on this target will be prevented.`
    }

    ret += `\r\nFQDN:"${item.FQDN}".`;

    return ret;
  }

}
