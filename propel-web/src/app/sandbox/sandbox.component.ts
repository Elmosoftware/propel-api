import { Component, OnInit } from '@angular/core';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { CoreService } from "../../services/core.service";

@Component({
  selector: 'app-root',
  templateUrl: './sandbox.component.html',
  styleUrls: ['./sandbox.component.css']
})
export class SandboxComponent implements OnInit {
  title = 'propel-web';

  dropdownList = [];
  selectedItems = [];
  dropdownSettings: IDropdownSettings = {};

  constructor(private core: CoreService) {
  }

  ngOnInit(){
    this.dropdownList = [
      { item_id: 1, item_text: 'Mumbai' },
      { item_id: 2, item_text: 'Bangaluru' },
      { item_id: 3, item_text: 'Pune' },
      { item_id: 4, item_text: 'Manhattan' },
      { item_id: 5, item_text: 'New Mangosta' },
      { item_id: 6, item_text: 'Cachimoro' },
      { item_id: 7, item_text: 'Fakturi mehta' },
      { item_id: 8, item_text: 'Caranagui also tirugi' },
      { item_id: 9, item_text: 'Jolofitegi garasuchi tol' },
      { item_id: 10, item_text: 'Carendra' },
      { item_id: 11, item_text: 'Chroma Chroma Chrome' },
      { item_id: 12, item_text: 'New Delhi' }
    ];
    this.selectedItems = [
      { item_id: 3, item_text: 'Pune' },
      { item_id: 4, item_text: 'Navsari' }
    ];
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'item_id',
      textField: 'item_text',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 10,
      allowSearchFilter: true
    };
  }

  onItemSelect(item: any) {
    console.log("onItemSelect")
    console.log(item);
  }
  onSelectAll(items: any) {
    console.log("onSelectAll")
    console.log(items);
  }

  goToHome() {
    this.core.navigation.toHome();
  }

  throwErrorTest() {
    throw new Error("ERROR TEST from Sandbox component.")
  }

  showToast() {
    this.core.toaster.showError();
  }

}
