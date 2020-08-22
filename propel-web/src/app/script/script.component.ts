import { Component, OnInit, ViewChild, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import 'prismjs';
import 'prismjs/components/prism-powershell';

import { FormHandler } from 'src/core/form-handler';
import { Script } from '../../../../propel-shared/models/script';
import { Category } from '../../../../propel-shared/models/category';
import { compareEntities } from '../../../../propel-shared/models/entity';
import { CoreService } from 'src/services/core.service';
import { DataLossPreventionInterface } from 'src/core/data-loss-prevention-guard';
import { QueryModifier } from '../../../../propel-shared/core/query-modifier';
import { APIResponse } from '../../../../propel-shared/core/api-response';
import { EntityDialogConfiguration } from '../dialogs/entity-group-dlg/entity-dlg.component';
import { DialogResult } from 'src/core/dialog-result';
import { ScriptParameter } from "../../../../propel-shared/models/script-parameter";
import { SystemHelper } from "../../util/system-helper";

declare var Prism: any;

enum Tabs {
  Details = 0,
  Code = 1,
  Finish = 2
}

const NAME_MIN: number = 3;
const NAME_MAX: number = 50;
const DESCRIPTION_MAX: number = 512;
const FILE_EXT: string = "ps1"
const MAX_FILE_SIZE: number = 2097152
const MAX_FILE_SIZE_TEXT: string = "2MB"

@Component({
  selector: 'app-script',
  templateUrl: './script.component.html',
  styleUrls: ['./script.component.css']
})
export class ScriptComponent implements OnInit, DataLossPreventionInterface {

  @ViewChild("category") category;

  private requestCount$: EventEmitter<number>;
  activeTab: Tabs = Tabs.Details;
  fh: FormHandler<Script>;
  allCategories: Category[] = [];
  uploadProgress: number;
  uploadEnabled: boolean;
  completed: boolean;
  invalidFileMessage: string;

  set scriptCode(value: string) {
    this.fh.form.controls.code.patchValue(value);
  }
  get scriptCode(): string {
    return this.fh.form.controls.code.value;
  }

  set scriptParameters(value: ScriptParameter[]) {
    this.fh.form.controls.parameters.patchValue(value);
  }
  get scriptParameters(): ScriptParameter[] {
    return this.fh.form.controls.parameters.value;
  }

  get highlightedCode(): string {
    if (this.scriptCode) return Prism.highlight(this.scriptCode, Prism.languages.powershell);
    else return ""
  }

  constructor(private core: CoreService, private route: ActivatedRoute) {

    this.fh = new FormHandler(Script, new FormGroup({
      name: new FormControl("", [
        Validators.required,
        Validators.minLength(NAME_MIN),
        Validators.maxLength(NAME_MAX)
      ]),
      description: new FormControl("", [
        Validators.maxLength(DESCRIPTION_MAX)
      ]),
      isSystem: new FormControl(""),
      isTargettingServers: new FormControl(""),
      category: new FormControl("", [
        Validators.required
      ]),
      readonly: new FormControl(""),
      code: new FormControl(""), //Didn't set this as required, because will be handled 
      //in a separate tab.
      parameters: new FormControl("")
    }));

    this.requestCount$ = this.core.navigation.getHttpRequestCountSubscription()
    this.requestCount$
      .subscribe((count: number) => {
        if (count > 0) {
          this.fh.form.disable({ emitEvent: false });
          this.uploadEnabled = false;
        }
        else {
          this.fh.form.enable({ emitEvent: false });
          this.uploadEnabled = true;
        }
      })
  }

  ngOnInit(): void {
    this.core.setPageTitle(this.route.snapshot.data);
    this.refreshData();
    this.refreshCategories();
  }

  resetForm() {
    this.activeTab = Tabs.Details;
    this.uploadProgress = 0;
    this.uploadEnabled = true;
    this.completed = false;
    this.invalidFileMessage = "";
  }

  refreshData(): void {
    let id: string = this.route.snapshot.paramMap.get("id");

    if (id) {
      this.core.data.getById(Script, id, false)
        .subscribe((data: APIResponse<Script>) => {
          if (data.count == 0) {
            this.core.toaster.showWarning("If you access directly with a link, maybe is broken. Go to the Browse page and try a search.", "Could not find the item")
            this.newItem();
          }
          else {
            this.fh.setValue(data.data[0])
            this.scriptCode = SystemHelper.decodeBase64(data.data[0].code);
            this.scriptParameters = data.data[0].parameters;
            this.resetForm();
          }
        },
          err => {
            throw err
          });
    }
    else {
      this.newItem();
    }
  }

  newItem() {
    this.fh.setValue(new Script());
    this.scriptCode = "";
    this.scriptParameters = [];
    this.resetForm();
  }

  refreshCategories() {
    let qm: QueryModifier = new QueryModifier();

    qm.sortBy = "name";

    this.core.data.find(Category, qm)
      .subscribe((results: APIResponse<Category>) => {
        this.allCategories = results.data;
      },
        err => {
          throw err
        });
  }


  /**
   * Used by the dropdowns to compare the values.
   */
  compareFn: Function = compareEntities;

  dataChanged(): boolean | Observable<boolean> | Promise<boolean> {
    return this.core.dataChanged(this.fh);
  }

  addCategory() {
    this.core.dialog.showEntityDialog(new EntityDialogConfiguration(Category, new Category()))
      .subscribe((dlgResults: DialogResult<Category>) => {

        if (!dlgResults.isCancel) {
          this.core.data.save(Category, dlgResults.value)
            .subscribe((results: APIResponse<string>) => {
              dlgResults.value._id = results.data[0];
              //Adding in this way for the On Push change detection, 
              //(See: https://github.com/ng-select/ng-select#change-detection).
              this.allCategories = [...this.allCategories, dlgResults.value];
              this.category.select({ name: dlgResults.value.name, value: dlgResults.value });
            },
              (err) => {
                throw err
              }
            );
        }
      },
        err => {
          throw err
        });
  }

  handleFileDrop(files: FileList): void {
    let reader = new FileReader();

    this.validateFile(files);

    if (this.invalidFileMessage) return;

    reader.onload = (e) => {
      let code = String(reader.result);
      this.uploadProgress = 50;

      this.core.psParametersinferrer.infer(code)
        .subscribe((results: APIResponse<ScriptParameter>) => {
          this.scriptParameters = results.data;
          this.scriptCode = code;
          this.uploadProgress = 100;
        },
          (err) => {
            this.scriptCode = code;
            this.scriptParameters = [];
            this.uploadProgress = 100;
            this.invalidFileMessage = `There was an error during the script parameters discovery process. 
          If the script has no parameters and you feel comfident the script is no having any runtime issues you can continue to the next step.`
            throw err
          }
        );
    }

    reader.readAsText(files[0]);
  }

  validateFile(files: FileList): void {
    this.invalidFileMessage = "";

    if (files.length > 1) {
      this.invalidFileMessage = `We found that you tried to upload more than one file. Only one file per script is allowed.`;
    }
    else if (files[0].name.lastIndexOf(".") == -1) {
      this.invalidFileMessage = `The file "${files[0].name}" has no extension, only .${FILE_EXT} files are allowed.`;
    }
    else if (files[0].name.slice(files[0].name.lastIndexOf(".") + 1).toLowerCase() !== FILE_EXT) {
      this.invalidFileMessage = `The file "${files[0].name}" is not a .${FILE_EXT} file.`;
    }
    else if (files[0].size > MAX_FILE_SIZE) {
      this.invalidFileMessage = `Current limit is ${MAX_FILE_SIZE_TEXT} per script file. The file "${files[0].name}" is bigger than that.`;
    }
  }

  save() {
    let script: Script = Object.assign({}, this.fh.form.value);
    script.code = SystemHelper.encodeBase64(script.code);

    this.core.data.save(Script, script)
      .subscribe((results: APIResponse<string>) => {
        this.core.toaster.showSuccess("Changes has been saved succesfully.");
        this.completed = true
        this.fh.setId(results.data[0]);
        this.fh.setValue(this.fh.value) //This is the saved value now, so setting this value 
        //will allow to come back to previous value if needed.
      },
        (err) => {
          this.completed = false;
          throw err
        })
  }

  addAnother() {
    this.newItem();
  }

  activeTabChanged($event: number) {
    this.activeTab = $event
  }

  isTabDisabled(tabIndex: Tabs): boolean {
    let ret: boolean = false

    if (this.fh.form.disabled) {
      ret = true;
    }
    else if (tabIndex == Tabs.Details) {
      ret = this.completed;
    }
    else if (tabIndex == Tabs.Code) {
      ret = this.fh.form.invalid || this.completed;
    }
    else if (tabIndex == Tabs.Finish) {
      ret = this.scriptCode == "" || this.completed;
    }

    return ret;
  }

  readyForNextTab(): boolean {
    return this.activeTab !== Tabs.Finish && !this.isTabDisabled(this.activeTab + 1);
  }

  next() {
    this.activeTab++;
  }

  back() {
    this.activeTab--;
  }

}
