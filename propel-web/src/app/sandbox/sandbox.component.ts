import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, AbstractControl, Validators, ValidatorFn } from "@angular/forms";
import { CoreService } from "src/services/core.service";
import { DataEndpointActions } from 'src/services/data.service';
import { ThemePalette } from '@angular/material/core';
import { StandardDialogConfiguration } from '../dialogs/standard-dialog/standard-dlg.component';
import { Entity, compareEntities } from '../../../../propel-shared/models/entity';
import { ValidatorsHelper } from 'src/core/validators-helper';
import { DialogResult } from 'src/core/dialog-result';
import { MatAccordion } from '@angular/material/expansion';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { Utils } from '../../../../propel-shared/utils/utils';
import { NgSelectComponent } from '@ng-select/ng-select';
import { QueryModifier } from '../../../../propel-shared/core/query-modifier';
import { PagedResponse } from '../../../../propel-shared/core/paged-response';
import { CustomValueDialogData } from '../dialogs/custom-value-dlg/custom-value-dlg.component';

@Component({
  selector: 'app-root',
  templateUrl: './sandbox.component.html',
  styleUrls: ['./sandbox.component.css']
})
export class SandboxComponent implements OnInit {

  @ViewChild(MatAccordion) accordion!: MatAccordion;
  @ViewChild('MyNGSelect') myNGSelect!: NgSelectComponent;
  @ViewChild('MyNGSelectWithNew') MyNGSelectWithNew!: NgSelectComponent;

  dropItem(item: any) {
    console.log("clearing the item!!!")
    this.myNGSelect.clearItem(item);
  }

  createNewItem() {
    // alert("Create!");
    // let newItem = "New One";
    // this.MyNGSelectWithNew.itemsList.addItem(newItem);
    // const item = this.MyNGSelectWithNew.itemsList.findItem(newItem)
    // this.MyNGSelectWithNew.select(item);

    this.core.dialog.showCustomValueDialog()
    .subscribe((result: DialogResult<CustomValueDialogData>) => {
      if (!result.isCancel) {
        this.MyNGSelectWithNew.itemsList.addItem(result.value.value);
        let item = this.MyNGSelectWithNew.itemsList.findItem(result.value.value);
        this.MyNGSelectWithNew.select(item);
      }
    }, err => {
      throw err
    });
    
  }

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
    return "Nulla aliquet porttitor lacus luctus accumsan tortor.\r\nPellentesque massa placerat duis ultricies lacus sed turpis tincidunt id.\r\nFermentum leo vel orci porta non pulvinar.";
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
    { _id: "1", name: "black", disabled: false },
    { _id: "2", name: "red", disabled: false },
    { _id: "3", name: "yellow", disabled: true },
    { _id: "4", name: "white", disabled: false },
    { _id: "5", name: "silver", disabled: false },
    { _id: "6", name: "maroon", disabled: false },
    // { _id: "7", name: "olive"},
    // { _id: "8", name: "green"},
    // { _id: "9", name: "aqua"},
    // { _id: "10", name: "teal"},
    // { _id: "11", name: "navy"},
    // { _id: "12", name: "fuchsia"},
    // { _id: "13", name: "purple"},

  ]

  testWithData: boolean = false;

  sampleData: SampleData = new SampleData();
  sampleForm: FormGroup = new FormGroup({
    name: new FormControl("", [
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
    ]),
    textList: new FormControl(this.sampleData.textList),
    password: new FormControl("", [
      Validators.required
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

  testWithDataChanged() {
    console.log("TEST with data changed!")
    this.sampleData = new SampleData();

    if (this.testWithData) {
      this.sampleData.name = "ValidName";
      this.sampleData.enabled = true;
      this.sampleData.country = this.countries[5];
      this.sampleData.colors.push(this.allColors[3]);
      // this.sampleData.colors.push(this.allColors[2]);
      //In order to be able to remove: we must drop the "disabled" property or turn it to "false" always:
      // let notDisabledColor = Object.assign({}, this.allColors[2]);
      // delete notDisabledColor.disabled
      // notDisabledColor.disabled = false;
      this.sampleData.colors.push(this.allColors[2]);
      // this.sampleData.colors.push(notDisabledColor);
      this.sampleData.textList = ["First", "Second"]
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

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;

  tableTotalResults: number = 10;
  targetResultsTable!: TargetResultsTable;
  tableFilterBy: string = "";
  showFilter: boolean = true;
  excludedFieldsList!: string;
  sortedColumnsList!: string

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
        text: `This is the ${(index + 1).toString()}`,
        date: new Date((new Date()).getTime() + (86400000 * (index + 1))),
        bol: Boolean((index + 1) % 4),
        longText: "This is a random long text to verify how the table accomodate on long content in cells."
      });
    }

    this.targetResultsTable = new TargetResultsTable(JSON.stringify(sampleData));
    this.targetResultsTable.dataSource.paginator = this.paginator;
    this.targetResultsTable.dataSource.sort = this.sort;
  }
  //#end region

  constructor(private core: CoreService) {

  }

  testEnum(enumType: any, value: string): boolean {
    return true;
  }


  ngOnInit() {
    this.testWithDataChanged();
    this.totalResultsChange();
    this.chartExample();
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
    // let ret: Credential

    // this.data.getById(DataEntity.Credential, "612300b0c8f78d6b5883b922")
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

    // qm.populate = false


    // this.data.find(DataEntity.Credential, qm)
    //   .subscribe(
    //     data => {
    //       let x = data;
    //     },
    //     err => {
    //       throw err
    //     });
    // qm.sortBy = "name";
    // qm.populate = true;

  }

  testInsert() {

    // let svi = new Secret()
    // svi.value = new Object()
    // svi.value.attr1 = "Hola"
    // svi.value.attr2 = 67.678;

    // this.data.save(DataEntity.Secret, svi)
    //   .subscribe(
    //     data => {
    //       svi._id = data.data[0];

    //       let c = new Credential();

    //       c.name = "Test Cred 01"
    //       c.description = "Description for credential"
    //       c.secretId = svi._id;

    //       this.data.save(DataEntity.Credential, c)
    //         .subscribe(
    //           data => {
    //             let x = data;
    //           },
    //           err => {
    //             throw err
    //           });


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

  testTwoCallsforRefreshToken() {

    console.info(`%c SANDBOX -> Starting Call 1 for token refreshing.`, "color: gray; background-color: lightblue");
    this.core.data.find(DataEndpointActions.Target, new QueryModifier())
      .then((result: PagedResponse<any>) => {
        console.info(`%c SANDBOX -> Receiving Call 1 response! Count is ${result.count}.`, "color: gray; background-color: lightblue");
      }, (err) => {
        console.info(`%c SANDBOX -> Receiving Call 1 error. Message: ${(err.message) ? err.message : JSON.stringify(err)}`, "color: gray; background-color: crimson")
        throw err
      })

    console.info(`%c SANDBOX -> Starting Call 2 for token refreshing.`, "color: gray; background-color: lightblue");
    this.core.data.find(DataEndpointActions.Credential, new QueryModifier())
      .then((result: PagedResponse<any>) => {
        console.info(`%c SANDBOX -> Receiving Call 2 response! Count is ${result.count}.`, "color: gray; background-color: lightblue");
      }, (err) => {
        console.info(`%c SANDBOX -> Receiving Call 2 error. Message: ${(err.message) ? err.message : JSON.stringify(err)}`, "color: gray; background-color: crimson")
        throw err
      })

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

  showCustomValueDialog(initialValue?: string | number, isString?: boolean) {
    this.core.dialog.showCustomValueDialog({ value: initialValue, typeIsString: isString })
    .subscribe((result: DialogResult<any>) => {
      alert(`Result is: "${JSON.stringify(result)}".`);
    }, err => {
      throw err
    });
  }

  expandAll() {
    this.accordion.openAll();
  }

  collapseAll() {
    this.accordion.closeAll();
  }

  viewpw: boolean = false

  toggleViewPassword() {
    this.viewpw = !this.viewpw;
  }

  /* CHARTS  */

  single: any[] = [
    {
      "name": "Germany",
      "value": 40
    },
    {
      "name": "USA",
      "value": 5000000
    },
    {
      "name": "France",
      "value": 7200000
    },
    {
      "name": "Portugal",
      "value": 4200000
    },
    {
      "name": "Europe",
      "value": 9200000
    }
  ];

  // multi: any[] = [
  //   {
  //     "name": "Germany",
  //     "series": [
  //       {
  //         "name": "2010",
  //         "value": 7300000
  //       },
  //       {
  //         "name": "2011",
  //         "value": 8940000
  //       }
  //     ]
  //   },
  
  //   {
  //     "name": "USA",
  //     "series": [
  //       {
  //         "name": "2010",
  //         "value": 7870000
  //       },
  //       {
  //         "name": "2011",
  //         "value": 8270000
  //       }
  //     ]
  //   },
  
  //   {
  //     "name": "France",
  //     "series": [
  //       {
  //         "name": "2010",
  //         "value": 5000002
  //       },
  //       {
  //         "name": "2011",
  //         "value": 5800000
  //       }
  //     ]
  //   }
  // ];
  multi: any[] = [
    {
      "name": "July 1st",
      "series": [
        {
          "name": "Workflows",
          "value": 7
        },
        {
          "name": "Quick Tasks",
          "value": 1
        }
      ]
    },
    {
      "name": "July 2nd",
      "series": [
        {
          "name": "Workflows",
          "value": 8
        },
        {
          "name": "Quick Tasks",
          "value": 0
        }
      ]
    },
    {
      "name": "July 3rd",
      "series": [
        {
          "name": "Workflows",
          "value": 0
        },
        {
          "name": "Quick Tasks",
          "value": 0
        }
      ]
    },
    {
      "name": "July 4th",
      "series": [
        {
          "name": "Workflows",
          "value": 3
        },
        {
          "name": "Quick Tasks",
          "value": 1
        }
      ]
    },
    {
      "name": "July 5ht",
      "series": [
        {
          "name": "Workflows",
          "value": 2
        },
        {
          "name": "Quick Tasks",
          "value": 4
        }
      ]
    },
    {
      "name": "July 6th",
      "series": [
        {
          "name": "Workflows",
          "value": 9
        },
        {
          "name": "Quick Tasks",
          "value": 3
        }
      ]
    },
    {
      "name": "July 7th",
      "series": [
        {
          "name": "Workflows",
          "value": 2
        },
        {
          "name": "Quick Tasks",
          "value": 0
        }
      ]
    },
    {
      "name": "July 8th",
      "series": [
        {
          "name": "Workflows",
          "value": 4
        },
        {
          "name": "Quick Tasks",
          "value": 7
        }
      ]
    },
    {
      "name": "July 9th",
      "series": [
        {
          "name": "Workflows",
          "value": 9
        },
        {
          "name": "Quick Tasks",
          "value": 3
        }
      ]
    },
    {
      "name": "July 10th",
      "series": [
        {
          "name": "Workflows",
          "value": 8
        },
        {
          "name": "Quick Tasks",
          "value": 2
        }
      ]
    },
    {
      "name": "July 11th",
      "series": [
        {
          "name": "Workflows",
          "value": 0
        },
        {
          "name": "Quick Tasks",
          "value": 1
        }
      ]
    },
    {
      "name": "July 11th",
      "series": [
        {
          "name": "Workflows",
          "value": 3
        },
        {
          "name": "Quick Tasks",
          "value": 3
        }
      ]
    },
    {
      "name": "July 12th",
      "series": [
        {
          "name": "Workflows",
          "value": 4
        },
        {
          "name": "Quick Tasks",
          "value": 0
        }
      ]
    },
    {
      "name": "July 13th",
      "series": [
        {
          "name": "Workflows",
          "value": 11
        },
        {
          "name": "Quick Tasks",
          "value": 5
        }
      ]
    },
    {
      "name": "July 14th",
      "series": [
        {
          "name": "Workflows",
          "value": 11
        },
        {
          "name": "Quick Tasks",
          "value": 6
        }
      ]
    },
    {
      "name": "July 15yh",
      "series": [
        {
          "name": "Workflows",
          "value": 7
        },
        {
          "name": "Quick Tasks",
          "value": 4
        }
      ]
    },
    {
      "name": "July 16th",
      "series": [
        {
          "name": "Workflows",
          "value": 3
        },
        {
          "name": "Quick Tasks",
          "value": 1
        }
      ]
    },
    {
      "name": "July 17th",
      "series": [
        {
          "name": "Workflows",
          "value": 2
        },
        {
          "name": "Quick Tasks",
          "value": 4
        }
      ]
    },
    {
      "name": "July 18th",
      "series": [
        {
          "name": "Workflows",
          "value": 13
        },
        {
          "name": "Quick Tasks",
          "value": 0
        }
      ]
    },
    {
      "name": "July 19th",
      "series": [
        {
          "name": "Workflows",
          "value": 1
        },
        {
          "name": "Quick Tasks",
          "value": 1
        }
      ]
    },
    {
      "name": "July 20th",
      "series": [
        {
          "name": "Workflows",
          "value": 4
        },
        {
          "name": "Quick Tasks",
          "value": 2
        }
      ]
    },
    {
      "name": "July 21th",
      "series": [
        {
          "name": "Workflows",
          "value": 3
        },
        {
          "name": "Quick Tasks",
          "value": 3
        }
      ]
    },
    {
      "name": "July 22th",
      "series": [
        {
          "name": "Workflows",
          "value": 10
        },
        {
          "name": "Quick Tasks",
          "value": 2
        }
      ]
    },
    {
      "name": "July 23th",
      "series": [
        {
          "name": "Workflows",
          "value": 2
        },
        {
          "name": "Quick Tasks",
          "value": 0
        }
      ]
    },
    {
      "name": "July 24th",
      "series": [
        {
          "name": "Workflows",
          "value": 0
        },
        {
          "name": "Quick Tasks",
          "value": 0
        }
      ]
    },
    {
      "name": "July 25th",
      "series": [
        {
          "name": "Workflows",
          "value": 0
        },
        {
          "name": "Quick Tasks",
          "value": 0
        }
      ]
    },
    {
      "name": "July 26th",
      "series": [
        {
          "name": "Workflows",
          "value": 5
        },
        {
          "name": "Quick Tasks",
          "value": 0
        }
      ]
    },
    {
      "name": "July 27th",
      "series": [
        {
          "name": "Workflows",
          "value": 3
        },
        {
          "name": "Quick Tasks",
          "value": 6
        }
      ]
    },
    {
      "name": "July 28th",
      "series": [
        {
          "name": "Workflows",
          "value": 7
        },
        {
          "name": "Quick Tasks",
          "value": 2
        }
      ]
    },
    {
      "name": "July 29th",
      "series": [
        {
          "name": "Workflows",
          "value": 13
        },
        {
          "name": "Quick Tasks",
          "value": 2
        }
      ]
    },
    {
      "name": "July 30th",
      "series": [
        {
          "name": "Workflows",
          "value": 2
        },
        {
          "name": "Quick Tasks",
          "value": 0
        }
      ]
    },
    {
      "name": "July 31th",
      "series": [
        {
          "name": "Workflows",
          "value": 5
        },
        {
          "name": "Quick Tasks",
          "value": 1
        }
      ]
    }       
  ];

  multiRotated: any[] = [
    {
      "name": "Workflows",
      "series": [
        {
          "name": "July 1st",
          "value": 7
        },
        {
          "name": "July 2",
          "value": 2
        },
        {
          "name": "July 3",
          "value": 11
        },
        {
          "name": "July 4",
          "value": 4
        },
        {
          "name": "July 5",
          "value": 1
        },
        {
          "name": "July 6",
          "value": 7
        },
        {
          "name": "July 7",
          "value": 2
        },
        {
          "name": "July 8",
          "value": 11
        },
        {
          "name": "July 9",
          "value": 4
        },
        {
          "name": "July 10",
          "value": 1
        },
        {
          "name": "July 11",
          "value": 7
        },
        {
          "name": "July 12",
          "value": 2
        },
        {
          "name": "July 13",
          "value": 11
        },
        {
          "name": "July 14",
          "value": 4
        },
        {
          "name": "July 15",
          "value": 1
        },
        {
          "name": "July 16",
          "value": 7
        },
        {
          "name": "July 17",
          "value": 2
        },
        {
          "name": "July 18",
          "value": 11
        },
        {
          "name": "July 19",
          "value": 4
        },
        {
          "name": "July 20",
          "value": 1
        },
        {
          "name": "July 21",
          "value": 7
        },
        {
          "name": "July 22",
          "value": 2
        },
        {
          "name": "July 23",
          "value": 11
        },
        {
          "name": "July 24",
          "value": 4
        },
        {
          "name": "July 25",
          "value": 1
        },
        {
          "name": "July 26",
          "value": 7
        },
        {
          "name": "July 27",
          "value": 2
        },
        {
          "name": "July 28",
          "value": 11
        },
        {
          "name": "July 29",
          "value": 4
        },
        {
          "name": "July 30",
          "value": 1
        },
        {
          "name": "July 31",
          "value": 5
        }
      ]
    },
    {
      "name": "Quick Tasks",
      "series": [
        {
          "name": "July 1st",
          "value": 1
        },
        {
          "name": "July 2",
          "value": 1
        },
        {
          "name": "July 3",
          "value": 0
        },
        {
          "name": "July 4",
          "value": 3
        },
        {
          "name": "July 5",
          "value": 0
        },
        {
          "name": "July 6",
          "value": 1
        },
        {
          "name": "July 7",
          "value": 4
        },
        {
          "name": "July 8",
          "value": 6
        },
        {
          "name": "July 9",
          "value": 2
        },
        {
          "name": "July 10",
          "value": 1
        },
        {
          "name": "July 11",
          "value": 3
        },
        {
          "name": "July 12",
          "value": 2
        },
        {
          "name": "July 13",
          "value": 1
        },
        {
          "name": "July 14",
          "value": 0
        },
        {
          "name": "July 15",
          "value": 1
        },
        {
          "name": "July 16",
          "value": 2
        },
        {
          "name": "July 17",
          "value": 2
        },
        {
          "name": "July 18",
          "value": 5
        },
        {
          "name": "July 19",
          "value": 1
        },
        {
          "name": "July 20",
          "value": 1
        },
        {
          "name": "July 21",
          "value": 3
        },
        {
          "name": "July 22",
          "value": 2
        },
        {
          "name": "July 23",
          "value": 3
        },
        {
          "name": "July 24",
          "value": 4
        },
        {
          "name": "July 25",
          "value": 0
        },
        {
          "name": "July 26",
          "value": 4
        },
        {
          "name": "July 27",
          "value": 2
        },
        {
          "name": "July 28",
          "value": 2
        },
        {
          "name": "July 29",
          "value": 1
        },
        {
          "name": "July 30",
          "value": 0
        },
        {
          "name": "July 31",
          "value": 4
        }
      ]
    }
  ];

  view = [700, 400];

  // options
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = false;
  showXAxisLabel = true;
  xAxisLabel = 'Country';
  showYAxisLabel = true;
  yAxisLabel = 'Population';

  colorScheme = "air"
  // colorScheme = {
  //   domain: ["#ffe89e", "#ff7878", "#328AAB", "#e6c761", "#e69a9a", "#487e92", "#ab3a32", "#924d48"] 
  // };
  cardColor: string = '#232837';

  onSelectChart($event: any) {
    console.log(JSON.stringify($event));
  }

  chartExample() {

  }


}

class SampleData {

  name: string = "";
  enabled: boolean = false;
  country?: Country = undefined;
  colors: Color[] = [];
  textList: string[] = [];

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
  disabled: boolean = false;

  constructor() {
    super()
  }
}

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
    return Boolean(this.currentFilterTerm && this.dataSource.filteredData
      && this.dataSource.filteredData.length == 0)
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

    if (this.isValidJSON) {
      parsedData = JSON.parse(rawData);

      if (!Array.isArray(parsedData)) {
        parsedData = [parsedData];
      }

      if (parsedData.length > 0) {
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
        //@ts-ignore
        Results: this.dataSource.toString()
      }]
      this.columns.push("Results");
    }

    this.dataSource = new MatTableDataSource(parsedData);
    this.originalData = parsedData;
  }
}