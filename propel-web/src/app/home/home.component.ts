import { Component, OnInit } from '@angular/core';
import { CoreService } from 'src/services/core.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private core: CoreService) { }

  ngOnInit(): void {
  }

  testWorkflow() {
    this.core.navigation.toRun("Testing workflow");
  }
}
