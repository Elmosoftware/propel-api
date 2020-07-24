import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, AbstractControl, Validators, ValidatorFn } from "@angular/forms";
import { CoreService } from "src/services/core.service";
import { DataService } from 'src/services/data.service';
import { User } from "../../../../propel-shared/models/user";
import { QueryModifier } from "../../../../propel-shared/core/query-modifier";
import { ThemePalette } from '@angular/material/core';
import { StandardDialogConfiguration } from '../dialogs/standard-dialog/standard-dlg.component';
import { Entity, compareEntities } from '../../../../propel-shared/models/entity';
import { ValidatorsHelper } from 'src/core/validators-helper';
import { Group } from '../../../../propel-shared/models/group';

// export function NoNameStartingWith(startText: string): ValidatorFn {
//   return (control: AbstractControl): {[key: string]: any} | null => {
//     let ret: any = null;

//     if(String(control.value).startsWith(startText)) {
//       ret = {'nonamestartingwith': {value: control.value, startText: startText}}
//     }

//     return ret;
//   };
// }

@Component({
  selector: 'app-root',
  templateUrl: './sandbox.component.html',
  styleUrls: ['./sandbox.component.css']
})
export class SandboxComponent implements OnInit {

  // minItems(min: number): ValidatorFn {
  //   return (control: AbstractControl): {[key: string]: any} | null => {
  //     let ret: any = null;

  //     if (control.value && Array.isArray(control.value) && control.value.length < min) {
  //       ret = {
  //         'minItems': {
  //           value: control.value, 
  //           requiredLength: min, 
  //           actualLength:control.value.length 
  //         }
  //       }
  //     }
  
  //     return ret;
  //   };
  // }

  // maxItems(max: number): ValidatorFn {
  //   return (control: AbstractControl): {[key: string]: any} | null => {
  //     let ret: any = null;

  //     if (control.value && Array.isArray(control.value) && control.value.length > max) {
  //       ret = {
  //         'maxItems': {
  //           value: control.value, 
  //           requiredLength: max, 
  //           actualLength:control.value.length 
  //         }
  //       }
  //     }
  
  //     return ret;
  //   };
  // }

  // getValidationErrors(control: AbstractControl): string {
  //   let ret: string = "";
    
  //   if (!control) return ret;
  //   if (!control.invalid) return ret;
  //   if (!control.errors) return ret;
  //   if(!(control.dirty || control.touched)) return ret;
    
  //   //Standard Validators:
  //   if (control.errors.required) {
  //     ret = `This information is required in order to continue.`; 
  //   }
  //   else if (control.errors.minlength && control.touched) {
  //     ret = `This must be at least ${control.errors.minlength.requiredLength} characters long. 
  //     (${control.errors.minlength.requiredLength - control.errors.minlength.actualLength} more needed).`
  //   }
  //   else if (control.errors.maxlength && control.touched) {
  //     ret = `This can't be longer than ${control.errors.maxlength.requiredLength}. 
  //     (Need to remove at least ${control.errors.maxlength.actualLength - control.errors.maxlength.requiredLength} characters).`
  //   }
  //   //Custom Validators:
  //   else if (control.errors.minItems && control.touched) {
  //     if (control.errors.minItems.requiredLength == 1) {
  //       ret = "You need to select at least 1 item from the list."
  //     }
  //     else {
  //       ret = `You need to select at least ${control.errors.minItems.requiredLength} items from the list.
  //       (${control.errors.minItems.requiredLength - control.errors.minItems.actualLength} extra item(s) needed).`
  //     }      
  //   }
  //   else if (control.errors.maxItems && control.touched) {
  //     if (control.errors.maxItems.requiredLength == 1) {
  //       ret = "You can't select more than one item in this list."
  //     }
  //     else {
  //       ret = `You can select a maximum of ${control.errors.maxItems.requiredLength} items from the list.
  //       (Need to remove at least ${control.errors.maxItems.actualLength - control.errors.maxItems.requiredLength} items).`
  //     }      
  //   }

  //   return ret;
  // }

  title = 'propel-web';

  // dropdownList = [];
  // selectedItems = [];
  // dropdownSettings: IDropdownSettings = {};
  // dropdownList2 = [];
  // selectedItems2 = [];
  // dropdownSettings2: IDropdownSettings = {};

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

  get tooltipSample(): string {
    return `Dynamically set value`;
  }

  //#region Reactive Form Sample

  countries: Country[] = [
    { _id: "1", name: 'Germany' },
    { _id: "2", name: 'Slovackia' },
    { _id: "3", name: 'France' },
    { _id: "4", name: 'Japan' },
    { _id: "5", name: 'Argentina' },
    { _id: "6", name: 'UK' },
    { _id: "7", name: 'Iceland' }
  ];

  allColors: Color[] = [
    { _id: "1", name: "black"},
    { _id: "2", name: "red"},
    { _id: "3", name: "yellow"},
    { _id: "4", name: "white"},
    { _id: "5", name: "silver"},
    { _id: "6", name: "maroon"},
    { _id: "7", name: "olive"},
    { _id: "8", name: "green"},
    { _id: "9", name: "aqua"},
    { _id: "10", name: "teal"},
    { _id: "11", name: "navy"},
    { _id: "12", name: "fuchsia"},
    { _id: "13", name: "purple"},

  ]
  
  // simpleSelectDropdownSettings: IDropdownSettings = {
  //   singleSelection: true,
  //   idField: '_id',
  //   textField: 'name',
  //   selectAllText: 'Select All',
  //   unSelectAllText: 'UnSelect All',
  //   itemsShowLimit: 10,
  //   allowSearchFilter: true,
  //   closeDropDownOnSelection: true
  // };

  testWithData: boolean = false;

  sampleData: SampleData = new SampleData();
  sampleForm: FormGroup = new FormGroup({
    name: new FormControl("",[
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(10)
    ]),
    enabled: new FormControl("", [
      Validators.requiredTrue
    ]),
    country: new FormControl("", [
      Validators.required
    ]),
    colors: new FormControl("", [
      ValidatorsHelper.minItems(2),
      ValidatorsHelper.maxItems(4)
    ])
  })  
  
  sampleFormSubmit() {
    console.log("Sample form Submitted!!!")
  }

  sampleFormOrControlStatus(control: AbstractControl): string {
    let ret: string = ""

    ret += (control.pristine) ? "pristine" : "dirty";
    ret += (control.valid) ? ", valid" : ", invalid";
    ret += (control.touched) ? ", touched" : ", untouched";

    return ret;
  }

  testWithDataChanged(){
    console.log("TEST with data changed!")
    this.sampleData = new SampleData();

    if (this.testWithData) {
      this.sampleData.name = "ValidName";
      this.sampleData.enabled = true;
      this.sampleData.country = this.countries[5];
      this.sampleData.colors.push(this.allColors[9]);
      this.sampleData.colors.push(this.allColors[10]);
    }

    this.sampleForm.patchValue(this.sampleData);    
  }

  /**
   * Used by the dropdowns to compare the values.
   */
  compareFn: Function = compareEntities;

  getErrorText(control: AbstractControl) {
    return ValidatorsHelper.getErrorText(control);
  }
  //#endregion

  constructor(private core: CoreService, private data: DataService) {

  }

  ngOnInit() {
    // this.dropdownList = [
    //   { item_id: 1, item_text: 'Mumbai' },
    //   { item_id: 2, item_text: 'Bangaluru' },
    //   { item_id: 3, item_text: 'Pune' },
    //   { item_id: 4, item_text: 'Manhattan' },
    //   { item_id: 5, item_text: 'New Mangosta' },
    //   { item_id: 6, item_text: 'Cachimoro' },
    //   { item_id: 7, item_text: 'Fakturi mehta' },
    //   { item_id: 8, item_text: 'Caranagui also tirugi' },
    //   { item_id: 9, item_text: 'Jolofitegi garasuchi tol' },
    //   { item_id: 10, item_text: 'Carendra' },
    //   { item_id: 11, item_text: 'Chroma Chroma Chrome' },
    //   { item_id: 12, item_text: 'New Delhi' }
    // ];
    // this.selectedItems = [
    //   { item_id: 3, item_text: 'Pune' },
    //   { item_id: 4, item_text: 'Navsari' }
    // ];
    // this.dropdownSettings = {
    //   singleSelection: false,
    //   idField: 'item_id',
    //   textField: 'item_text',
    //   selectAllText: 'Select All',
    //   unSelectAllText: 'UnSelect All',
    //   itemsShowLimit: 10,
    //   allowSearchFilter: true
    // };
    // //For the single mode demo:
    // this.dropdownList2 = [
    //   { item_id: 1, item_text: 'Item 1' },
    //   { item_id: 2, item_text: 'Item 2' },
    //   { item_id: 3, item_text: 'Item 3' },
    //   { item_id: 4, item_text: 'Item 4' },
    //   { item_id: 5, item_text: 'Item 5' },
    //   { item_id: 6, item_text: 'Item 6' },
    //   { item_id: 7, item_text: 'Item 7' }
    // ];
    // this.dropdownSettings2 = {
    //   singleSelection: true,
    //   idField: 'item_id',
    //   textField: 'item_text',
    //   selectAllText: 'Select All',
    //   unSelectAllText: 'UnSelect All',
    //   itemsShowLimit: 10,
    //   allowSearchFilter: true
    // };
    // this.selectedItems2 = [
    //   // { item_id: 1, item_text: 'Item 1' }
    // ];

    //========================================================

  //   setTimeout(() => {
    
  //     this.sampleData = new SampleData();

  //     this.sampleData.name = "ValidName";
  //     this.sampleData.enabled = true;
  //     this.sampleData.country = this.countries[5];

  //   // this.sampleForm.removeControl("country");
  //   // this.sampleForm.registerControl("country", new FormControl(this.sampleData.country, [
  //   //   Validators.required
  //   // ]))
  //   // this.sampleForm.controls.country.patchValue(this.sampleData.country);
  //   // this.sampleForm.controls.country.patchValue([]);
  //     // this.sampleForm.controls.country.patchValue(this.sampleData.country);
  //     this.sampleForm.patchValue(this.sampleData);
  //     this.sampleForm.controls.country.patchValue(this.sampleData.country._id);

  //  }, 2000);

    //========================================================

    this.testWithDataChanged();
  }

  // onItemSelect(item: any) {
  //   console.log("onItemSelect")
  //   console.log(item);
  // }
  // onSelectAll(items: any) {
  //   console.log("onSelectAll")
  //   console.log(items);
  // }

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

    return ret;
  }

  testFind() {
    // let ret: User[]
    // let qm: QueryModifier = new QueryModifier();
    // qm.top = 1000;
    // qm.skip = 0;
    // qm.sortBy = "initials";
    // qm.populate = true;
    // qm.filterBy = "{\"picture\": {\"$eq\": null}}"

    // this.data.find(User, qm)
    //   .subscribe(
    //     data => {
    //       let x = data;
    //     },
    //     err => {
    //       throw err
    //     });

    // ret = this.data.create(MyClasesita)

    let qm: QueryModifier = new QueryModifier();
    
    qm.sortBy = "name";
    qm.populate = true;
    
    this.data.find(Group,qm)
    .subscribe(
      data => {
        let x = data;
      },
      err => {
        throw err
      });
    // return ret;
  }

  testInsert() {

    let u: User = new User();

    u.email = "spongebob3@hotmail.com"
    u.initials = "sb3"
    u.name = "Bob the third"

    this.data.save<User>(User, u)
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

    u._id = "5f18eee52dcf570b148586e8"
    // u.email = "spongebob3@hotmail.com"
    // u.initials = "sb3"
    u.name = "Bob the third UPDATED"

    this.data.save<User>(User, u)
      .subscribe(
        data => {
          let x = data;
        },
        err => {
          throw err
        });
  }

  testDelete() {

    this.data.delete<User>(User, "5f18eee52dcf570b148586e8")
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

class SampleData {
  
  name: string = "";
  enabled: boolean = false;
  country?: Country = null;
  colors: Color[] = [];
  
  constructor() {
  }  
}

class Country extends Entity {

  name: string = "";

  constructor() {
    super()
  }
}

class Color extends Entity {

  name: string = "";

  constructor() {
    super()
  }
}