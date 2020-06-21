import { Component, OnInit } from '@angular/core';
import { CoreService } from 'src/services/core.service';

@Component({
  selector: 'app-run',
  templateUrl: './run.component.html',
  styleUrls: ['./run.component.css']
})
export class RunComponent implements OnInit {

  constructor(private core: CoreService) {

  }

  ngOnInit(): void {
  }

  testWS() {
    this.core.runner.execute("")
    .subscribe((data) => {
      console.log(`Receiving:"${JSON.stringify(data)}"`);
    },
    (err) => {
      console.log(`There was an error:${err}`);
    },
    () => {
      console.log("COMPLETE!");
    });
  }

}
