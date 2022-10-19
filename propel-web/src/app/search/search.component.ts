import { Component, OnInit, EventEmitter } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CoreService } from 'src/services/core.service';
import { QueryModifier } from '../../../../propel-shared/core/query-modifier';
import { Entity } from '../../../../propel-shared/models/entity';
import { ValidatorsHelper } from 'src/core/validators-helper';
import { UIHelper } from 'src/util/ui-helper';
import { Utils } from '../../../../propel-shared/utils/utils';
import { InfiniteScrollingService, PagingHelper, SCROLL_POSITION } from 'src/core/infinite-scrolling-module';
import { SearchType, SearchTypeDefinition, DEFAULT_SEARCH_TYPE } from "./search-type";
import { Workflow } from '../../../../propel-shared/models/workflow';
import { environment } from 'src/environments/environment';
import { PagedResponse } from '../../../../propel-shared/core/paged-response';

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

  private requestCount$!: EventEmitter<number>;

  searchTypeEnum = SearchType;
  fg!: UntypedFormGroup;
  svcInfScroll!: InfiniteScrollingService<Entity>;
  onDataFeed!: EventEmitter<PagingHelper>;
  currentSearchTerm: string = "";

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
    let ret: string = "";

    if (this.fg.controls['searchText'].valid) {
      if (this.termIsQuoted) {
        ret = this.fg.value.searchText;
      }
      else {
        ret = UIHelper.tokenizeAndStem(this.fg.value.searchText)
          .join(" ");
      }
    }

    return ret;
  }

  get browseMode(): boolean {
    let ret: boolean = false;

    if (this.fg.controls['browse'].value && this.fg.controls['browse'].value.toLowerCase() == "true") {
      ret = true;
    }

    return ret;
  }

  get showAll(): boolean {
    return this.currentSearchTerm == "" && this.browseMode;
  }

  get isAdmin(): boolean {
    return this.core.security.isUserLoggedIn && this.core.security.sessionData.roleIsAdmin;
  }

  constructor(private core: CoreService, private route: ActivatedRoute) {

  }

  ngOnInit(): void {
    this.core.setPageTitle(this.route.snapshot.data);
    this._buildForm();

    this.requestCount$ = this.core.navigation.getHttpRequestCountSubscription()
    this.requestCount$
      .subscribe({
        next: (count: number) => {
          if (count > 0) {
            this.fg.disable({ emitEvent: false });
          }
          else {
            this.fg.enable({ emitEvent: false });
          }
        }
      })

    if (this.showAll || this.currentSearchTerm !== "") {
      this.search();
    }
  }

  search() {
    this.resetSearch();
    this.fetchData(this.svcInfScroll.pageSize, 0)
      .then(() => {
        console.log(`Search finished`)
      }, (error) => {
        this.core.handleError(error)
      })
  }

  onDataFeedHandler(ph: PagingHelper): void {
    this.fetchData(ph.top, ph.skip)
      .then(() => {
        console.log(`Processing data page ${ph.page} of ${ph.pages}, (top:${ph.top}, skip:${ph.skip}).`)
      },
        (error) => {
          this.core.handleError(error)
        })
  }

  onDataChangedHandler($events: any): void {
    console.log(`Data changed, refreshing ...`)
    this.search();
  }

  async fetchData(top: number, skip: number, forceStrictSearch: boolean = false): Promise<void> {
    let strictSearch: boolean = this.termIsQuoted || forceStrictSearch;
    let termsToSearch: string[] = [];
    let qm = new QueryModifier();

    if (this.svcInfScroll.model) {
      this.core.toaster.showInformation("We are retrieving more data from your search. It will be available soon.", "Retrieving data");
    }

    qm.top = top;
    qm.skip = skip;
    qm.populate = false;

    this.currentSearchTerm = this.searchTerm

    //If we are not in Browsing mode, this is, there is a search term specified. We initialize 
    //the filter:
    if (!this.showAll) {
      if (strictSearch) {
        termsToSearch.push(Utils.removeQuotes(this.currentSearchTerm));
      }
      else {
        termsToSearch = this.currentSearchTerm.split(" ");
      }

      //If the term to search is quoted, we are going to perform an exact search:
      if (strictSearch) {

        qm.filterBy = {
          $or: []
        };

        SearchTypeDefinition.getFullTextFields(this.searchType).forEach((field) => {
          qm.filterBy.$or.push({
            [field]: {
              $regex: termsToSearch[0],
              /*
                Starting on Mongo DB v5.1, the global search modifier, ("g"), is no longer supported.
                More details [here](https://www.mongodb.com/docs/manual/reference/operator/query/regex/#mongodb-query-op.-options).
              */
              $options: "i"
            }
          })
        });

        qm.sortBy = SearchTypeDefinition.getDefaultSort(this.searchType);
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
      qm.sortBy = SearchTypeDefinition.getDefaultSort(this.searchType);
    }

    //Adding any additional filter condition specified for this search type:
    let additionalFilter = SearchTypeDefinition.getAdditionalFilterConditions(this.searchType);

    Object.getOwnPropertyNames(additionalFilter).forEach((condition) => {
      qm.filterBy[condition] = additionalFilter[condition];
    });

    try {
      let pagedData = await this.getData(this.fg.controls['searchType'].value, qm);

      //If is a text search that retrieves no results, we must try now 
      //with a strict search to see if we can get anything:
      if (!strictSearch && pagedData.count == 0) {
        await this.fetchData(top, skip, true);
        return Promise.resolve();
      }

      this.svcInfScroll.feed(pagedData.totalCount, pagedData.data);

      if (this.svcInfScroll.count > 0) {
        this.core.toaster.showInformation(`Showing now ${this.svcInfScroll.count} results of a total of ${this.svcInfScroll.totalCount} coincidences found. 
            ${(this.svcInfScroll.totalCount > this.svcInfScroll.count) ? "Keep scrolling to see more." : ""}   `, "New results have been added.")
      }
    } catch (error) {
      return Promise.reject(error)
    }

    //On every new search, we must replace the navigation history, to 
    //allow the user to go back to the last search:
    if (skip == 0) {
      this.core.navigation.replaceHistory("",
        { term: String(this.currentSearchTerm), browse: (this.browseMode) ? "true" : "false" });
    }

    return Promise.resolve();
  }

  async getData(type: SearchType, qm: QueryModifier): Promise<PagedResponse<Entity>> {

    // /////////////////////////////////////////////////////////////////////////////
    // // DEBUG ONLY: For testing purposes only of the infinite scrolling feature:
    // if (environment.production == false) {
    //   if (type == SearchType.Workflows) {
    //     return this._fakeWorkflowCreation(3000, 100, qm);    
    //     //test throwing an error:
    //     // throw new PropelError("TEST ERROR", ErrorCodes.CryptoError)
    //   }
    // }
    // /////////////////////////////////////////////////////////////////////////////

    return this.core.data.find(SearchTypeDefinition.getDataEntity(type), qm);
  }

  resetSearch() {
    this.svcInfScroll = new InfiniteScrollingService<Entity>(PAGE_SIZE);
    this.onDataFeed = this.svcInfScroll.dataFeed;

    this.onDataFeed
      .subscribe({
        next: (ph: PagingHelper) => {
          this.onDataFeedHandler(ph)
        }
      });
  }

  onScrollEndHandler(e: SCROLL_POSITION): void {
    this.svcInfScroll.onScrollEndHandler(e);
  }

  fullScrollUp() {
    this.svcInfScroll.fullScrollUp();
  }

  fullScrollDown() {
    this.svcInfScroll.fullScrollDown();
  }

  /**
   * This adds some HTML to the fields text to remark the matches.
   * @param data returned data.
   * @param words search criteria
   * @param fields search fields
   * @returns Highlighted text.
   */
  private _processMatches(data: any[], words: string[], fields: string[]): any[] {
    data.forEach((entity: any) => {
      fields.forEach((fieldName, i) => {
        let chunk: number | undefined = (i == 0) ? undefined : 30;
        entity[fieldName] = UIHelper.highlighText(entity[fieldName], words, chunk);
      })
    })

    return data;
  }

  private _buildForm(): void {
    let term: string = "";
    let searchType: string = DEFAULT_SEARCH_TYPE.toString();
    let browse: string = "false";
    let pageSuffix: string = this.core.navigation.getCurrentPageSuffix();

    if (pageSuffix) {
      searchType = String(Utils.getEnumValue(SearchType, pageSuffix, false))

      //If for some reason the page suffix is not right, we will prepare a search for the 
      //default search type:
      if (!searchType) {
        searchType = DEFAULT_SEARCH_TYPE.toString();
      }
    }

    if (this.route.snapshot.queryParamMap.get("term")) {
      term = this.route.snapshot.queryParamMap.get("term") ?? ""
    }

    if (this.route.snapshot.queryParamMap.get("browse")) {
      browse = this.route.snapshot.queryParamMap.get("browse") ?? browse
    }

    this.fg = new UntypedFormGroup({
      searchText: new UntypedFormControl(term, [
        Validators.minLength(SEARCH_TEXT_MIN),
        Validators.maxLength(SEARCH_TEXT_MAX),
        ValidatorsHelper.searchableText()
      ]),
      searchType: new UntypedFormControl(searchType),
      browse: new UntypedFormControl(browse)
    });
  }

  private _fakeWorkflowCreation(totalWorkflows: number, msTimeout: number, qm: QueryModifier): Promise<PagedResponse<Workflow>> {
    //================================================================================================
    //DEBUG ONLY:
    //================================================================================================
    if (environment.production) return Promise.reject("Not a prod feature.");

    let data: Workflow[] = [];
    let top: number = Number(qm.top);
    let skip: number = Number(qm.skip);
    let words: string[] = [];

    if (qm.filterBy.$text) {
      words = qm.filterBy.$text.$search.split(" ");
    }
    else if (qm.filterBy.$or) {
      words.push(String(qm.filterBy.$or[0].name.$regex));
    }

    //To emulate no data retrieved, sent the search term "nodata":
    if (words.length > 0 && words[0] == "nodata") {
      return Promise.resolve(new PagedResponse<Workflow>(data, 0))
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

    return Promise.resolve(new PagedResponse<Workflow>(data, totalWorkflows))
  }
}
