import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { CoreService } from 'src/services/core.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private core: CoreService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.core.setPageTitle(this.route.snapshot.data);
  }

  testWorkflow() {
    this.core.navigation.toRun("Testing workflow");
  }
}
