import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { MatLegacyPaginator as MatPaginator } from '@angular/material/legacy-paginator';

/**
 * This dinamic table is able to present not only arrays of objects but also arrays of literals.
 * When that happen, the name of the column will be this by default.
 */
const DEFAULT_COLUMN_NAME: string = "Data";

/**
 * The paginator will not be displayes at least the amount to rows is higher than this value.
 */
const DEFAULT_PAGINATOR_MIN_ROWS: number = 50;

@Component({
  selector: 'app-dynamic-table',
  templateUrl: './dynamic-table.component.html',
  styleUrls: ['./dynamic-table.component.css']
})
export class DynamicTableComponent implements OnInit {

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;

  get data(): any {
    return this._data;
  }  

  /**
   * Data to represent in the table. it could be a single element or an array of either literal values or objects.
   */
  @Input("data")
  set data(value: any) {
    this._data = value;
    this.refreshData();
  }

  get columnOrder(): string[] {
    return this._columnOrder
  }  

  /**
   * Order in which the columns will be displayed. There is no need to specify all the columns here, you 
   * can specify only the columns you want to be displayed at left only. 
   */
  @Input("column-order")
  set columnOrder(value: string | string[]) {
    if (Array.isArray(value)) {
      this._columnOrder = value
    }
    else {
      this._columnOrder = String(value)
        .split(",")
        .map((val) => val.trim());
    }
    this.refreshData();
  }

  /**
   * Minimum amount of rows to fore showing the paginator.
   */
  @Input("paginator-min-rows") paginatorMinRows!: string;
  get showPaginator(): boolean {
    let ret: boolean = false;
    let min: number;

    if (!this.paginatorMinRows || isNaN(Number(this.paginatorMinRows))) {
      min = Number(DEFAULT_PAGINATOR_MIN_ROWS);
    }
    else {
      min = Number(this.paginatorMinRows);
    }

    return this._data && this.data.length >= min;
  }

  get showFilter(): boolean {
    return this._showFilter;
  }  
  
  /**
   * Boolean value that indicates in the filter controls are going to be displayed.
   */
  @Input("show-filter") 
  set showFilter(value: boolean) {
    this._showFilter = value;

    if (!this._showFilter) {
      this.removeFilter();
    }
  }

  get excludedFields(): string[] {
    return this._excludedFields;
  }  

  /**
   * If you want to exclude some fields in the table representation you can include them 
   * here using a comma separator.
   */
  @Input("excluded-fields") 
  set excludedFields(value) {

    if (Array.isArray(value)) {
      this._excludedFields = value
        .map((item) => String(item).trim().toLowerCase());
    }
    else {
      this._excludedFields = String(value)
        .split(",")
        .map((item: string) => item.trim().toLowerCase());
    }   
    
    this.refreshData();
  }

  private _showFilter: boolean = true;
  private _excludedFields: string[] = [];
  private _data: any;
  private _columnOrder: string[] = [];
  dataSource!: MatTableDataSource<any>;
  columns!: string[];
  filter: string = "";
  
  paginatorPageSizeOptions: number[] = [];


  get noMatches(): boolean {
    return Boolean(this.filter && this.dataSource && this.dataSource.filteredData
      && this.dataSource.filteredData.length == 0);
  }

  constructor() { }

  ngOnInit(): void {
    this.refreshData();
  }

  refreshData() {
    this.columns = [];

    if(!this.data) return;

    if (!Array.isArray(this.data)) {
      this.data = [this.data];
    }

    if (this.data.length > 0) {
      //Analyzing the first element of the array in order to figure out what we are dealing with;
      if (typeof this.data[0] == "object") {
        Object.keys(this.data[0]).forEach((prop: string) => {
          if (!this.excludedFields.includes(prop.toLowerCase())) {
            this.columns.push(prop);
          }
        });
      }
      else {
        this.data.forEach((item: any, i: number) => {
          this.data[i] = {
            [DEFAULT_COLUMN_NAME]: item 
          }
        });

        this.columns.push(DEFAULT_COLUMN_NAME);
      }
    }

    this.sortColumns();
    this.dataSource = new MatTableDataSource(this.data);
    this.dataSource.paginator = this.paginator;

    if (this.showPaginator) {
      this.paginatorPageSizeOptions = [5, 10, 25, 50]
      this.dataSource.paginator.pageSize = 25;
    }
    else {
      this.paginatorPageSizeOptions = [];
      this.dataSource.paginator.pageSize = this.data.length;
    }
    this.dataSource.paginator.pageIndex = 0;
    this.dataSource.sort = this.sort;
  }

  sortColumns() {

    if(!this.columns || this.columns.length == 0 || !this._columnOrder || this._columnOrder.length == 0) return;

    this.columnOrder.forEach((col: string, i: number) =>{
      let pos: number = this.columns.findIndex((item) => item.toLowerCase() == col.toLowerCase())
      //If the column exists and is not already in the desired position:
      if (pos >= 0 && pos != i) {
        this.columns.splice(pos, 1);
        this.columns.splice(i, 0, col);
      }
    })
  }

  applyFilter() {
    this.dataSource.filter = this.filter.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  removeFilter() {
    this.filter = "";
    this.applyFilter();
  }
}
