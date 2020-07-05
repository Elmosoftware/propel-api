import { Component, OnInit } from '@angular/core';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { CoreService } from "src/services/core.service";
import { DataService } from 'src/services/data.service';
import { User } from "../../../../propel-shared/models/user";
import { QueryModifier } from "../../../../propel-shared/core/query-modifier";
import {ThemePalette} from '@angular/material/core';
import { StandardDialogConfiguration } from '../dialogs/standard-dialog/standard-dlg.component';

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
  dropdownList2 = [];
  selectedItems2 = [];
  dropdownSettings2: IDropdownSettings = {};

  color: ThemePalette = 'accent';
  checked = false;
  disabled = false;
  rangeValue = 30;

  get rangeMode(): string {
    if (this.rangeValue == 100) {
      return "determinate"
    }
    else {
      return "indeterminate"
    }
  }

  constructor(private core: CoreService, private data: DataService) {

  }

  ngOnInit() {
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
    //For the single mode demo:
    this.dropdownList2 = [
      { item_id: 1, item_text: 'Item 1' },
      { item_id: 2, item_text: 'Item 2' },
      { item_id: 3, item_text: 'Item 3' },
      { item_id: 4, item_text: 'Item 4' },
      { item_id: 5, item_text: 'Item 5' },
      { item_id: 6, item_text: 'Item 6' },
      { item_id: 7, item_text: 'Item 7' }
    ];
    this.dropdownSettings2 = {
      singleSelection: true,
      idField: 'item_id',
      textField: 'item_text',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 10,
      allowSearchFilter: true
    };
    this.selectedItems2 = [
      // { item_id: 1, item_text: 'Item 1' }
    ];
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

  showToastError() {
    this.core.toaster.showError();
  }

  showToastInfo() {
    this.core.toaster.showInformation("This is the information message we would like to show to the user.");
  }

  showToastWarning() {
    this.core.toaster.showWarning("This is the warning message to be displayed.")
  }

  showToastSuccess() {
    this.core.toaster.showSuccess("The operation was successfully finished!")
  }

  testGetById() {
    let ret: User

    this.data.getById(User, "5e7c195b001fa35f5c4db76c")
      .subscribe(
        data => {
          let x = data;
        },
        err => {
          throw err
        });

    // ret = this.data.create(MyClasesita)

    return ret;
  }

  testFind() {
    let ret: User[]
    let qm: QueryModifier = new QueryModifier();
    qm.top = 1000;
    qm.skip = 0;
    qm.sortBy = "initials";
    qm.populate = true;
    qm.filterBy = "{\"picture\": {\"$eq\": null}}"

    this.data.find(User, qm)
      .subscribe(
        data => {
          let x = data;
        },
        err => {
          throw err
        });

    // ret = this.data.create(MyClasesita)

    return ret;
  }

  testInsert() {

    let u: User = new User();

    u.email = "spongebob2@hotmail.com"
    u.initials = "sb2"
    u.name = "Bob the second"

    this.data.insert<User>(User, u)
      .subscribe(
        data => {
          let x = data;
        },
        err => {
          throw err
        });
  }

  testUpdate() {

    let u: User = new User();

    u._id = "5ee3e24f4094354ae4f355ce"
    u.email = "spongebob2@hotmail.com"
    u.initials = "sb2"
    u.name = "Bob the second UPDATED Twice!"

    this.data.update<User>(User, u)
      .subscribe(
        data => {
          let x = data;
        },
        err => {
          throw err
        });
  }

  testDelete() {

    let u: User = new User();

    u._id = "5ee3e24f4094354ae4f355ce"

    this.data.delete<User>(User, u)
      .subscribe(
        data => {
          let x = data;
        },
        err => {
          throw err
        });
  }

  showLongConfirmationDialog() {
    this.core.dialog.showConfirmDialog(new StandardDialogConfiguration("Confirmación de cambio de contraseña",
      `Si confirmas tu intención de cambiar tu contraseña de acceso, se te enviará un correo 
      a <i>micorreo@email.com</i> con las instrucciones detalladas para crear tu nueva contraseña.
      <p class="mt-2 mb-0">Recuerda que el mensaje de cambio de contraseña tiene un tiempo de validez, pasado el cual, el correo
       ya no será válido y deberás volver a iniciar el proceso.</p>`,
      "Si, deseo cambiar mi contraseña", "No, continuaré con la actual")).subscribe(result => {
        alert(`Result is: "${String(result)}"`);
      }, err => {
        throw err
      });
  }
  
  showShortConfirmationDialog() {
    this.core.dialog.showConfirmDialog(new StandardDialogConfiguration( 
        "Confirmation required",
        `Do you confirm the action?`)
      ).subscribe(result => {
        alert(`Result is: "${String(result)}"`);
      }, err => {
        throw err
      });
  }

}
