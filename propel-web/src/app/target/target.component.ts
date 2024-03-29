import { Component, OnInit, EventEmitter, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from "@angular/forms";

import { CoreService } from 'src/services/core.service';
import { compareEntities } from '../../../../propel-shared/models/entity';
import { Target } from "../../../../propel-shared/models/target";
import { ValidatorsHelper } from 'src/core/validators-helper';
import { QueryModifier } from '../../../../propel-shared/core/query-modifier';
import { DataLossPreventionInterface } from 'src/core/data-loss-prevention-guard';
import { forkJoin, Observable, from } from 'rxjs';
import { FormHandler } from "../../core/form-handler";
import { DataEndpointActions } from 'src/services/data.service';
import { Credential } from "../../../../propel-shared/models/credential";
import { PagedResponse } from '../../../../propel-shared/core/paged-response';
import { NgSelectComponent } from '@ng-select/ng-select';

const FRIENDLY_NAME_MIN: number = 3;
const FRIENDLY_NAME_MAX: number = 25;
const DESCRIPTION_MAX: number = 256;

@Component({
  selector: 'app-target',
  templateUrl: './target.component.html',
  styleUrls: ['./target.component.css']
})
export class TargetComponent implements OnInit, DataLossPreventionInterface {

  @ViewChild("invokeAs") invokeAs!: NgSelectComponent;

  private requestCount$: EventEmitter<number>;
  fh: FormHandler<Target>
  allWindowsCredentials!: Credential[];
  showAddNewButton: boolean = false;
  credentialIsDisabled: boolean = false;

  get isValid(): boolean {
    return (this.fh.form.valid && !this.credentialIsDisabled);
  }

  constructor(private core: CoreService, private route: ActivatedRoute) {

    this.fh = new FormHandler(DataEndpointActions.Target, new FormGroup({
      FQDN: new FormControl("", [
        Validators.required,
        ValidatorsHelper.FQDN()
      ]),
      friendlyName: new FormControl("", [
        Validators.required,
        Validators.minLength(FRIENDLY_NAME_MIN),
        Validators.maxLength(FRIENDLY_NAME_MAX)
      ]),
      description: new FormControl("", [
        Validators.maxLength(DESCRIPTION_MAX)
      ]),
      invokeAs: new FormControl(""),
      enabled: new FormControl(""),
    }));

    this.requestCount$ = this.core.navigation.getHttpRequestCountSubscription()
    this.requestCount$
      .subscribe({
        next: (count: number) => {
          if (count > 0) {
            this.fh.form.disable({ emitEvent: false });
          }
          else {
            this.fh.form.enable({ emitEvent: false });
          }
        }
      })
  }

  /**
   * Used by the dropdowns to compare the values.
   */
  compareFn: Function = compareEntities;

  dataChanged(): boolean | Observable<boolean> | Promise<boolean> {
    return this.core.dataChanged(this.fh);
  }

  ngOnInit(): void {
    this.core.setPageTitle(this.route.snapshot.data);

    //Doing this with a timeout to avoid the "ExpressionChangedAfterItHasBeenCheckedError" error:
    setTimeout(() => {
      forkJoin({
        credentials: from(this.refreshCredentials())
        //if there is anything else to refresh, add it here...
      })
        .subscribe({
          next: (results) => {

            //We are adding here a temporary field "disabled". This field 
            //is required for the @NgSelect component to identify disabled items in the list and prevent 
            //them to be selected:

            this.allWindowsCredentials = results.credentials.data.map(item => {
              //@ts-ignore
              item.disabled = false;
              return item;
            });

            this.refreshData()
              .catch((error) => {
                this.core.handleError(error)
              })
          }
        });
    });
  }

  async refreshData(): Promise<void> {
    let id: string = this.route.snapshot.paramMap.get("id") ?? "";

    if (!id) {
      this.newItem();
      return Promise.resolve();
    }

    try {
      let target: Target = await this.core.data.getById(DataEndpointActions.Target, id, true) as Target;

      if (!target) {
        this.core.toaster.showWarning("If you access directly with a link, maybe is broken. Go to the Browse page and try a search.", "Could not find the item")
        this.newItem();
        return Promise.resolve();
      }

      //If the target has a credential, but is not in the list of credentials in cahce, then
      //the credential must be deleted:
      if (target.invokeAs && !this.getCredentialFromCache(target.invokeAs._id)) {
        let c = new Credential()
        c._id = target.invokeAs._id
        c.name = target.invokeAs.name
        /* Note: 
          We are adding this credential with disabled=false because for some reason the 
          cross button to remove an item from the dropdown is not working when the item is disabled.
          So, we are managing this condition with a new "isDisabled" attribute only for this cases.
        */
        //@ts-ignore
        c.disabled = false;
        //@ts-ignore
        c.isDisabled = true;

        //Adding the deleted credential to the whole list:
        this.allWindowsCredentials = [...this.allWindowsCredentials, c];
        this.invokeAs.select({ name: c.name, value: c }); //Selecting the credential in the dropdown.

      }

      this.fh.setValue(target)
      return Promise.resolve();

    } catch (error) {
      return Promise.reject(error);
    }
  }

  async refreshCredentials(): Promise<PagedResponse<Credential>> {
    let qm: QueryModifier = new QueryModifier();
    qm.sortBy = "name";
    qm.filterBy = {
      credentialType: {
        $eq: "Windows"
      }
    }

    return (this.core.data.find(DataEndpointActions.Credential, qm) as unknown as PagedResponse<Credential>)
  }

  credentialChanged($event: any) {
    this.credentialIsDisabled = ($event && $event.isDisabled);
  }

  getCredentialFromCache(id: string): Credential | undefined {
    return this.allWindowsCredentials.find((credential: Credential) => {
      return credential._id == String(id);
    });
  }

  newItem() {
    this.fh.setValue(new Target());
    this.showAddNewButton = false;
  }

  save() {
    this.core.data.save(DataEndpointActions.Target, this.fh.value)
      .then((id: string) => {
        this.core.toaster.showSuccess("Changes have been saved succesfully.");
        this.fh.setId(id);
        this.fh.setValue(this.fh.value) //This is the saved value now, so setting this value 
        //will allow the "Cancel" button to come back to this version.

        //Replacing in the navigation history the URL so when the user navigate back 
        //and if we are creating an item it will edit the created item instead of showing 
        //a new item form:
        this.core.navigation.replaceHistory(this.fh.getId());
        this.showAddNewButton = true;
      },
        (error) => {
          this.core.handleError(error)
        }
      );
  }

  resetForm() {
    this.fh.resetForm();

    let credId = (this.fh.value.invokeAs?._id) ? this.fh.value.invokeAs._id : this.fh.value.invokeAs;

    if (credId) {
      let cred: Credential = this.getCredentialFromCache(String(credId))!
      this.invokeAs.select({ name: cred.name, value: cred });

      //@ts-ignore
      this.credentialIsDisabled = Boolean(cred?.isDisabled);
    }
  }
}
