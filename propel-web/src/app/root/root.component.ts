import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  template: '<app-navigation-bar></app-navigation-bar><router-outlet></router-outlet>'
})
export class RootComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
