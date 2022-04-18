import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CoreService } from 'src/services/core.service';

@Component({
  selector: 'app-unauthorized',
  templateUrl: './unauthorized.component.html',
  styleUrls: ['./unauthorized.component.css']
})
export class UnauthorizedComponent implements OnInit {

  constructor(private core: CoreService, private route: ActivatedRoute) {

  }

  ngOnInit(): void {
    this.core.setPageTitle(this.route.snapshot.data);
  }

  toHome() {
    this.core.navigation.toHome();
  }
}
