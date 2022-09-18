import { Component, OnInit, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import 'prismjs';
import 'prismjs/components/prism-powershell';

import { FormHandler } from 'src/core/form-handler';
import { Script } from '../../../../propel-shared/models/script';
import { compareEntities } from '../../../../propel-shared/models/entity';
import { CoreService } from 'src/services/core.service';
import { DataLossPreventionInterface } from 'src/core/data-loss-prevention-guard';
import { ScriptParameter } from "../../../../propel-shared/models/script-parameter";
import { SystemHelper } from "../../util/system-helper";
import { DataEndpointActions } from 'src/services/data.service';
import { PropelError } from '../../../../propel-shared/core/propel-error';

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
const MAX_FILE_SIZE: number = 1048576
const MAX_FILE_SIZE_TEXT: string = "1MB"

@Component({
  selector: 'app-script',
  templateUrl: './script.component.html',
  styleUrls: ['./script.component.css']
})
export class ScriptComponent implements OnInit, DataLossPreventionInterface {

  private requestCount$: EventEmitter<number>;
  activeTab: Tabs = Tabs.Details;
  fh: FormHandler<Script>;
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

    this.fh = new FormHandler(DataEndpointActions.Script, new FormGroup({
      name: new FormControl("", [
        Validators.required,
        Validators.minLength(NAME_MIN),
        Validators.maxLength(NAME_MAX)
      ]),
      description: new FormControl("", [
        Validators.maxLength(DESCRIPTION_MAX)
      ]),
      isTargettingServers: new FormControl(""),
      enabled: new FormControl(""),
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
    this.refreshData()
      .catch(this.core.handleError)
  }

  resetForm() {
    this.activeTab = Tabs.Details;
    this.uploadProgress = 0;
    this.uploadEnabled = true;
    this.completed = false;
    this.invalidFileMessage = "";
  }

  async refreshData(): Promise<void> {
    let id: string = this.route.snapshot.paramMap.get("id");

    if (!id) {
      this.newItem();
      return Promise.resolve()
    }

    try {
      let script: Script = await this.core.data.getById(DataEndpointActions.Script, id, false) as Script

      if (!script) {
        this.core.toaster.showWarning("If you access directly with a link, maybe is broken. Go to the Browse page and try a search.", "Could not find the item")
        this.newItem();
        return Promise.resolve()
      }

      this.fh.setValue(script)
      this.scriptCode = SystemHelper.decodeBase64(script.code);
      this.scriptParameters = script.parameters;
      this.resetForm();
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error)
    }
  }

  newItem() {
    this.fh.setValue(new Script());
    this.scriptCode = "";
    this.scriptParameters = [];
    this.resetForm();
  }

  /**
   * Used by the dropdowns to compare the values.
   */
  compareFn: Function = compareEntities;

  dataChanged(): boolean | Observable<boolean> | Promise<boolean> {
    return this.core.dataChanged(this.fh);
  }

  handleFileDrop(files: FileList): void {
    let reader = new FileReader();

    this.validateFile(files);

    if (this.invalidFileMessage) return;

    reader.onload = (e) => {
      let code = String(reader.result);
      this.uploadProgress = 50;

      this.core.paramInference.infer(code)
        .then((params: ScriptParameter[]) => {
          this.scriptParameters = params;
          this.scriptCode = code;
          this.uploadProgress = 100;
        },
          (error) => {
            let e: PropelError = new PropelError(error)
            this.scriptCode = code;
            this.scriptParameters = [];
            this.uploadProgress = 100;
            this.invalidFileMessage = `There was an error during the script parameters discovery process. 
          If the script has no parameters and you feel comfident the script is no having any runtime issues you can continue to the next step.`

            if (e.errorCode) {
              this.invalidFileMessage = `${e.errorCode.description}\r\n${e.errorCode.userMessage}`
            }

            this.core.handleError(e)
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

    this.core.data.save(DataEndpointActions.Script, script)
      .then((id: string) => {
        this.core.toaster.showSuccess("Changes have been saved succesfully.");
        this.completed = true
        this.fh.setId(id);
        this.fh.setValue(this.fh.value) //This is the saved value now, so setting this value 
        //will allow to come back to previous value if needed.

        //Replacing in the navigation history the URL so when the user navigate back 
        //and if we are creating an item it will edit the created item instead of showing 
        //a new item form:
        this.core.navigation.replaceHistory(this.fh.getId());
      },
        (error) => {
          this.completed = false;
          this.core.handleError(error)
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
