import { Component, OnInit } from '@angular/core';

import { CoreService } from 'src/services/core.service';

@Component({
  selector: 'app-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.css']
})
export class NavigationBarComponent implements OnInit {

  constructor(private core: CoreService) {
  }

  ngOnInit(): void {
  }

  goToHome() {
    this.core.navigation.toHome();
  }
}
