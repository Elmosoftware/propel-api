import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, AbstractControl, Validators, ValidatorFn } from "@angular/forms";
import { CoreService } from "src/services/core.service";
import { DataService, DataEntity } from 'src/services/data.service';
import { ThemePalette } from '@angular/material/core';
import { StandardDialogConfiguration } from '../dialogs/standard-dialog/standard-dlg.component';
import { Entity, compareEntities } from '../../../../propel-shared/models/entity';
import { ValidatorsHelper } from 'src/core/validators-helper';
import { Group } from '../../../../propel-shared/models/group';
import { DialogResult } from 'src/core/dialog-result';
import { EntityDialogConfiguration } from '../dialogs/entity-group-dlg/entity-dlg.component';
import { MatAccordion } from '@angular/material/expansion';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { Utils } from '../../../../propel-shared/utils/utils';

@Component({
  selector: 'app-root',
  templateUrl: './sandbox.component.html',
  styleUrls: ['./sandbox.component.css']
})
export class SandboxComponent implements OnInit {

  @ViewChild(MatAccordion) accordion: MatAccordion;

  title = 'propel-web';
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

  get tooltipSampleLong(): string {
    return "Nulla aliquet porttitor lacus luctus accumsan tortor.\nPellentesque massa placerat duis ultricies lacus sed turpis tincidunt id.\nFermentum leo vel orci porta non pulvinar.";
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

  //#region MatTable Sample

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  tableTotalResults: number = 10;
  targetResultsTable: TargetResultsTable;
  tableFilterBy: string = "";
  showFilter: boolean = true;
  excludedFieldsList: string;
  sortedColumnsList: string

  applyFilter() {
    this.targetResultsTable.applyFilter(this.tableFilterBy);
  }

  removeFilter() {
    this.tableFilterBy = "";
    this.targetResultsTable.removeFilter();
  }

  totalResultsChange() {
    let sampleData = [];

    for (let index = 0; index < this.tableTotalResults; index++) {
      sampleData.push({
        i: index + 1,
        first: "Mark",
        last: "Otto",
        handle: "@mdo-rtyui_tytyruwiiiw_dgfgrgstatta",
        ind: index + 1,
        text: `This is the ${(index+1).toString()}`,
        date: new Date((new Date()).getTime() + (86400000 * (index+1))),
        bol: Boolean((index+1) % 4),
        longText: "This is a random long text to verify how the table accomodate on long content in cells."
      });
    }

    this.targetResultsTable = new TargetResultsTable(JSON.stringify(sampleData));
    this.targetResultsTable.dataSource.paginator = this.paginator;
    this.targetResultsTable.dataSource.sort = this.sort;
  }
  //#end region

  constructor(private core: CoreService, private data: DataService) {

  }

  ngOnInit() {
    this.testWithDataChanged();
    this.totalResultsChange()
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
    // let ret: User

    // this.data.getById(User, "5e7c195b001fa35f5c4db76c")
    //   .subscribe(
    //     data => {
    //       let x = data;
    //     },
    //     err => {
    //       throw err
    //     });

    // return ret;
  }

  testFind() {
    // let qm: QueryModifier = new QueryModifier();
    
    // qm.sortBy = "name";
    // qm.populate = true;
    
    // this.data.find(Group,qm)
    // .subscribe(
    //   data => {
    //     let x = data;
    //   },
    //   err => {
    //     throw err
    //   });
  }

  testInsert() {

    // let u: User = new User();

    // u.email = "spongebob3@hotmail.com"
    // u.initials = "sb3"
    // u.name = "Bob the third"

    // this.data.save<User>(User, u)
    //   .subscribe(
    //     data => {
    //       let x = data;
    //     },
    //     err => {
    //       throw err
    //     });
  }

  testUpdate() {

    // let u: User = new User();

    // u._id = "5f18eee52dcf570b148586e8"
    // u.name = "Bob the third UPDATED"

    // this.data.save<User>(User, u)
    //   .subscribe(
    //     data => {
    //       let x = data;
    //     },
    //     err => {
    //       throw err
    //     });
  }

  testDelete() {

    // this.data.delete<User>(User, "5f18eee52dcf570b148586e8")
    //   .subscribe(
    //     data => {
    //       let x = data;
    //     },
    //     err => {
    //       throw err
    //     });
  }

  showLongConfirmationDialog() {
    this.core.dialog.showConfirmDialog(new StandardDialogConfiguration("Confirmación de cambio de contraseña",
      `Si confirmas tu intención de cambiar tu contraseña de acceso, se te enviará un correo 
      a <i>micorreo@email.com</i> con las instrucciones detalladas para crear tu nueva contraseña.
      <p class="mt-2 mb-0">Recuerda que el mensaje de cambio de contraseña tiene un tiempo de validez, pasado el cual, el correo
       ya no será válido y deberás volver a iniciar el proceso.</p>`,
      "Si, deseo cambiar mi contraseña", "No, continuaré con la actual"))
      .subscribe((result: DialogResult<any>) => {
        alert(`Result is: "${JSON.stringify(result)}".`);
      }, err => {
        throw err
      });
  }
  
  showShortConfirmationDialog() {
    this.core.dialog.showConfirmDialog(new StandardDialogConfiguration( 
        "Confirmation required",
        `Do you confirm the action?`)
      ).subscribe((result: DialogResult<any>) => {
        alert(`Result is: "${JSON.stringify(result)}".`);
      }, err => {
        throw err
      });
  }

  showEntityDialog() {
    this.core.dialog.showEntityDialog(new EntityDialogConfiguration(DataEntity.Group, new Group()))
    .subscribe((results: DialogResult<Group>) => {
      alert(`Result is: "${JSON.stringify(results)}".`);
    },
      err => {
        throw err
      });
  }

  expandAll() {
    this.accordion.openAll();
  }

  collapseAll() {
    this.accordion.closeAll();
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

// class TableDataSample {
//   readonly id: number;
//   readonly text: string;
//   readonly date: Date;
//   readonly bol: boolean;
//   readonly longText: string;

//   constructor(id: number) {
//     this.id = id;
//     this.text = `This is the ${id.toString()}`;
//     this.date = new Date((new Date()).getTime() + (86400000 * id));
//     this.bol = Boolean(id % 3);
//     this.longText = "This is a random long text to verify how the table accomodate on long content in cells."
//   }
// }

class TargetResultsTable {

  readonly isValidJSON: boolean;
  readonly columns: string[];
  readonly dataSource: MatTableDataSource<any>;
  originalData: any[];
  currentFilterTerm: string = "";

  get noData(): boolean {
    return this.dataSource && this.dataSource.data && this.dataSource.data.length == 0;
  }

  get noMatches(): boolean {
    return this.currentFilterTerm && this.dataSource.filteredData 
      && this.dataSource.filteredData.length == 0
  }

  applyFilter(term: string) {
    this.currentFilterTerm = term;
    this.dataSource.filter = this.currentFilterTerm.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  removeFilter() {
    this.currentFilterTerm = "";
    this.applyFilter(this.currentFilterTerm);
  }

  getValue(dataItemOrIndex: any | number, columnNameOrIndex: string | number) {


  }

  constructor(rawData: string) {

    let parsedData: any;
    this.columns = [];
    this.originalData = [];
    this.isValidJSON = Utils.isValidJSON(rawData);

    if(this.isValidJSON) {
      parsedData = JSON.parse(rawData);

      if (!Array.isArray(parsedData)) {
        parsedData = [parsedData];
      }
      
      if(parsedData.length > 0) {
        //Analyzing the first element of the array in order to figure out what we are dealing with;
        if (typeof parsedData[0] == "object") {
          Object.keys(parsedData[0]).forEach((prop: string) => {
            this.columns.push(prop);
          });
        }
        else {
          this.columns.push("Results");
        }
      }
    }
    else {
      parsedData = [{
        Results: this.dataSource.toString()
      }]
      this.columns.push("Results");
    }

    this.dataSource = new MatTableDataSource(parsedData);
    this.originalData = parsedData;
  }  
}