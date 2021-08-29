import { Component, OnInit, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of, Observable } from 'rxjs';
import { delay } from 'rxjs/operators';

import { CoreService } from 'src/services/core.service';
import { QueryModifier } from '../../../../propel-shared/core/query-modifier';
import { APIResponse } from '../../../../propel-shared/core/api-response';
import { Entity } from '../../../../propel-shared/models/entity';
import { ValidatorsHelper } from 'src/core/validators-helper';
import { UIHelper } from 'src/util/ui-helper';
import { Utils } from '../../../../propel-shared/utils/utils';
import { InfiniteScrollingService, PagingHelper, SCROLL_POSITION } from 'src/core/infinite-scrolling-module';
import { PropelError } from '../../../../propel-shared/core/propel-error';
import { DataEntity } from 'src/services/data.service';

/**
 * Search types defined.
 * IMPORTANT NOTE: They must match in count and order with the tabs in the component.
 */
export enum SearchType {
  Workflows = "workflows",
  Scripts = "scripts",
  Targets = "targets",
  Credentials = "credentials"
}

export const DEFAULT_SEARCH_TYPE: SearchType = SearchType.Workflows;

/**
 * Size of each data page.
 */
const PAGE_SIZE: number = 50;

const SEARCH_TEXT_MIN: number = 3;
const SEARCH_TEXT_MAX: number = 50;

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  private requestCount$: EventEmitter<number>;

  searchTypeEnum = SearchType;
  activeTab: number; // = SearchTabs.Scripts;
  fg: FormGroup;
  svcInfScroll: InfiniteScrollingService<Entity>;
  onDataFeed: EventEmitter<PagingHelper>;

  get termIsQuoted(): boolean {
    return Utils.isQuotedString(this.fg.value.searchText);
  }

  get searchType(): SearchType {
    let ret: SearchType = DEFAULT_SEARCH_TYPE;

    if (this.fg && this.fg.value.searchType) {
        ret = this.fg.value.searchType;
    }

    return ret;
  }

  get searchTerm(): string {
    let ret: string = this.fg.value.searchText;

    if (this.fg.controls.searchText.valid && !this.termIsQuoted) {
      ret = UIHelper.tokenizeAndStem(ret)
        .join(" ");
    }

    return ret;
  }

  get browseMode(): boolean {
    let ret: boolean = false;

    if (this.fg.controls.browse.value && this.fg.controls.browse.value.toLowerCase() == "true") {
      ret = true;
    }

    return ret;
  }

  get showAll(): boolean {
    return this.searchTerm == "" && this.browseMode;
  }

  constructor(private core: CoreService, private route: ActivatedRoute) {

  }

  ngOnInit(): void {
    this.core.setPageTitle(this.route.snapshot.data);
    this._buildForm();

    this.requestCount$ = this.core.navigation.getHttpRequestCountSubscription()
    this.requestCount$
      .subscribe((count: number) => {
        if (count > 0) {
          this.fg.disable({ emitEvent: false });
        }
        else {
          this.fg.enable({ emitEvent: false });
        }
      })

    //If there is a search term specified or we need to browse all the items, we start 
    //the search immediately:
    if (this.showAll || this.searchTerm !== "") {
      this.search();
    }
  }

  search() {
    this.resetSearch();
    // this.currentSearchType = this.fg.controls.searchType.value;
    //TODO: Crear el metodo de abajo.
    this.activateTab(this.fg.controls.searchType.value)
    this.fetchData(this.svcInfScroll.pageSize, 0);
  }

  activateTab(type: SearchType): void {
    this.activeTab = Utils.getEnumIndex(SearchType, type, false);
  }

  activeTabChanged($event: number) {
    this.fg.controls.searchType.patchValue(Utils.getEnum(SearchType)[$event].value)
    this.search()
  }

  fetchData(top: number, skip: number): void {
    let strictSearch: boolean = this.termIsQuoted;
    let termsToSearch: string[] = [];
    let qm = new QueryModifier();

    if (this.svcInfScroll.model) {
      this.core.toaster.showInformation("We are retrieving more data from your search. It will be available soon.", "Retrieving data");
    }

    qm.top = top;
    qm.skip = skip;
    qm.populate = false;

    //If we are not in Browsing mode, this is, there is a search term specified. We initialize 
    //the filter:
    if (!this.showAll) {
      if (strictSearch) {
        termsToSearch.push(Utils.removeQuotes(this.searchTerm));
      }
      else {
        termsToSearch = this.searchTerm.split(" ");
      }

      //If the term to search is quoted, we are going to perform an exact search:
      if (strictSearch) {
        qm.filterBy = {
          $or: [
            {
              "name": {
                $regex: termsToSearch[0],
                $options: "gi"
              }
            },
            {
              "description": {
                $regex: termsToSearch[0],
                $options: "gi"
              }
            }
          ]
        };

        qm.sortBy = "name";
      }
      //Otherwise we are going to perform a full text search:
      else {
        qm.filterBy = {
          $text: {
            $search: termsToSearch.join(" ")
          }
        };
      }
    }
    //If we are in browsing mode, this is, we need to show all the results. We are 
    //going to sort by main field: 
    else {
      qm.sortBy = (this.fg.controls.searchType.value == SearchType.Targets) ? "friendlyName" : "name";
    }

    //Adding conditions specific to Workflows here:
    if (this.fg.controls.searchType.value == SearchType.Workflows) {
      qm.filterBy.isQuickTask = {
        $eq: false
      }
    }

    this.getData(this.fg.controls.searchType.value, qm)
      .subscribe((results: APIResponse<Entity>) => {

        let f1: string = (this.fg.controls.searchType.value == SearchType.Targets) ? "friendlyName" : "name";
        let f2: string = "description";
        let d = results.data;

        //If we are showing all the results, there is no need to highlight any word matches:
        if (!this.showAll) {
          d = this._processMatches(d, termsToSearch, f1, f2)
        }

        this.svcInfScroll.feed(results.totalCount, d);

        if (this.svcInfScroll.count > 0) {
          this.core.toaster.showInformation(`Showing now ${this.svcInfScroll.count} results of a total of ${this.svcInfScroll.totalCount} coincidences found. 
            ${(this.svcInfScroll.totalCount > this.svcInfScroll.count) ? "Keep scrolling to see more." : ""}   `, "New results have been added.")
        }
      },
        err => {
          throw err
        });
  }

  getData(type: SearchType, qm: QueryModifier): Observable<APIResponse<any>> {
    let entityType: DataEntity;

    switch (type) {
      case SearchType.Workflows:
        entityType = DataEntity.Workflow;
        break;
      case SearchType.Scripts:
        entityType = DataEntity.Script;
        break;
      case SearchType.Targets:
        entityType = DataEntity.Target;
        break;
      case SearchType.Credentials:
        entityType = DataEntity.Credential;
        break;
      default:
        throw new PropelError(`There is no search type define with name ${type}`)
    }

    /////////////////////////////////////////////////////////////////////////////////
    //DEBUG:       For testing purposes only of the infinite scrrolling feature:
    // if (type == SearchType.Workflows) {
    //   return this._fakeWorkflowCreation(1000, 100, qm);      
    // }
    // throw new Error("FAKE ERROR!!!");
    /////////////////////////////////////////////////////////////////////////////////

    return this.core.data.find(entityType, qm);
  }

  resetSearch() {
    this.svcInfScroll = new InfiniteScrollingService<Entity>(PAGE_SIZE);
    this.onDataFeed = this.svcInfScroll.dataFeed;

    this.onDataFeed
      .subscribe((ph: PagingHelper) => {
        this.onDataFeedHandler(ph)
      });
  }

  onScrollEndHandler(e: SCROLL_POSITION): void {
    this.svcInfScroll.onScrollEndHandler(e);
  }

  onDataFeedHandler(ph: PagingHelper): void {
    this.fetchData(ph.top, ph.skip);
  }

  onDataChangedHandler($events): void {
    this.search();
  }

  fullScrollUp() {
    this.svcInfScroll.fullScrollUp();
  }

  fullScrollDown() {
    this.svcInfScroll.fullScrollDown();
  }

  private _processMatches(data: any[], words: string[], field1Name: string, field2Name: string): any[] {
    data.forEach((ent: any) => {
      ent[field1Name] = UIHelper.highlighText(ent[field1Name], words);
      ent[field2Name] = UIHelper.highlighText(ent[field2Name], words, 30);
    })

    return data;
  }

  private _buildForm(): void {
    let term: string = "";
    let searchType: string = DEFAULT_SEARCH_TYPE.toString();
    let browse: string = "false";
    let pageSuffix:string = this.core.navigation.getCurrentPageSuffix();

    if (pageSuffix) {
      searchType = String(Utils.getEnumValue(SearchType, pageSuffix, false))
      
      //If for some reason the page suffix is not right, we will prepare a search for the 
      //default search type:
      if (!searchType) {
        searchType = DEFAULT_SEARCH_TYPE.toString();
      }
    }

    if (this.route.snapshot.queryParamMap.get("term")) {
      term = this.route.snapshot.queryParamMap.get("term")
    }

    if (this.route.snapshot.queryParamMap.get("browse")) {
      browse = this.route.snapshot.queryParamMap.get("browse")
    }

    this.fg = new FormGroup({
      searchText: new FormControl(term, [
        Validators.minLength(SEARCH_TEXT_MIN),
        Validators.maxLength(SEARCH_TEXT_MAX),
        ValidatorsHelper.searchableText()
      ]),
      searchType: new FormControl(searchType),
      browse: new FormControl(browse)
    });
  }

  /*================================================================================================
        Used for testing purposes only:
    ================================================================================================
   
  private _fakeWorkflowCreation(totalWorkflows: number, msTimeout: number, qm: QueryModifier): Observable<APIResponse<Workflow>> {

    let data: Workflow[] = [];
    let top: number = Number(qm.top);
    let skip: number = Number(qm.skip);
    let words: string[] = [];

    if (qm.filterBy.$text) {
      words = qm.filterBy.$text.$search.split(" ");
    }
    else if(qm.filterBy.$or){
      words.push(String(qm.filterBy.$or[0].name.$regex));
    }

    //To emulate no data retrieved, sent the search term "nodata":
    if (words.length > 0 && words[0] == "nodata") {
      return of(new APIResponse<Workflow>(null, data, 0))
        .pipe(delay(msTimeout));
    }

    for (let i = (skip + 1); i < (skip + top + 1); i++) {
      let w = new Workflow()

      let w0 = words[0];
      let w1 = (words.length > 1) ? words[1] : "";
      let w2 = (words.length > 2) ? words[2] : "";
      let w3 = (words.length > 3) ? words[3] : "";
      let w4 = (words.length > 4) ? words[4] : "";

      w.name = `TEST #${i} for searched words: "${w0}"`; // ${word.toUpperCase()}`;
      w.description = `Et ligula ullamcorper malesuada ${w0} proin libero ${w1} nunc consequat interdum.
Fermentum et sollicitudin ac orci phasellus egestas ${w2} ${w3} tellus rutrum tellus. Diam phasellus vestibulum 
lorem sed risus ultricies. Erat imperdiet sed euismod nisi ${w4} porta lorem mollis. Feugiat in ante metus 
dictum at tempor commodo ullamcorper a.`; // Searched word is ${word}.`;

      data.push(w);

      if (i == totalWorkflows) {
        break;
      }
    }

    return of(new APIResponse<Workflow>(null, data, totalWorkflows))
      .pipe(delay(msTimeout));
  }
  */
}
