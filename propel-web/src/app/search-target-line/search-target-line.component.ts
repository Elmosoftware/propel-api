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

}
