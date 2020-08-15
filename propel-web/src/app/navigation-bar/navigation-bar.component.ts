import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { CoreService } from 'src/services/core.service';

@Component({
  selector: 'app-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.css']
})
export class NavigationBarComponent implements OnInit {

  constructor(private core: CoreService, private route: ActivatedRoute) {
  }

  loading: boolean;

  ngOnInit(): void {

    this.core.navigation.getHttpRequestCountSubscription()
      .subscribe((counter: number) => {
          this.loading = counter > 0;
      })
  }

  goToHome() {
    this.core.navigation.toHome();
  }

  goToTarget() {
    this.core.navigation.toTarget();
  }

  goToScript() {
    this.core.navigation.toScript();
  }

  goToQuickTask() {
    this.core.navigation.toQuickTask();
  }
}
