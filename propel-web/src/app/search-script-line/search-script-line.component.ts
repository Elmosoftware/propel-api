import { Component, OnInit, Input } from '@angular/core';
import { Script } from '../../../../propel-shared/models/script';
import { CoreService } from 'src/services/core.service';

@Component({
  selector: 'app-search-script-line',
  templateUrl: './search-script-line.component.html',
  styleUrls: ['./search-script-line.component.css']
})
export class SearchScriptLineComponent implements OnInit {

  @Input() model: Script[];

  constructor(private core: CoreService) {

  }

  ngOnInit(): void {
  }

  goToEditScript(id: string) {
    this.core.navigation.toScript(id);
  }
}
