import { Component, OnInit, Input } from '@angular/core';
import { Workflow } from '../../../../propel-shared/models/workflow';
import { CoreService } from 'src/services/core.service';

@Component({
  selector: 'app-search-workflow-line',
  templateUrl: './search-workflow-line.component.html',
  styleUrls: ['./search-workflow-line.component.css']
})
export class SearchWorkflowLineComponent implements OnInit {

  @Input() model: Workflow[];

  constructor(private core: CoreService) { 

  }

  ngOnInit(): void {

  }

  goToEditWorkflow(id: string) {
    this.core.navigation.toWorkflow(id);
  }

  run(id: string) {
    this.core.navigation.toRun(id);
  }
}
