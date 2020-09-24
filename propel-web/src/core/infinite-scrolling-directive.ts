import { Directive, HostListener, EventEmitter, Output, Input, ElementRef } from '@angular/core';

export const enum SCROLL_POSITION {
  Top = "TOP",
  Bottom = "BOTTOM"
};

@Directive({
  selector: '[infinite-scrolling]'
})
export class InfiniteScrollingDirective {

  /**
   * Boolean value that indicates if we will capture scroll events from the element that is holding the "infinite-scrolling" 
   * directive or directly from the browser window.
   * 
   * By default we will capture events from the browser window.
   */
  @Input() scrollWindow: boolean = true;

  /**
   * This is the top percentage value of the vertical scrolling that will cause to trigger the "scrollPosition" event.
   * 
   * e.g:
   * The default value for this attribute is 15, Which means that when our scrolling is 15% of the top and we are scrolling 
   * up the event will be fired.
   */
  @Input() scrollUpTrigger: number = 15;

  /**
   * This is the bottom percentage value of the vertical scrolling that will cause to trigger the "scrollEnd" event.
   * 
   * e.g:
   * The default value for this attribute is 85, Which means that when our scrolling is 85% of the top, (or what is the same 15% 
   * from bottom), and we are scrolling down the event will be fired.
   */
  @Input() scrollDownTrigger: number = 85;

  /**
   * This event will be triggered every time the user scrolls. The Event will return a number that indicate the scrolling percentage. 
   */
  @Output() scroll = new EventEmitter<number>(); 

  /**
   * This event will be triggered when the user scrolls and reach the top or bottom limit.
   */
  @Output() scrollEnd = new EventEmitter<SCROLL_POSITION>(); 

  private _perc: number = 0
  private _prevPerc: number = 0;

  constructor(public el: ElementRef) { }

  //Listener or the Window scroll:
  @HostListener("window:scroll", [])
  onWindowScroll() {
    this._processEvent();
  }

  //Listener of the element scroll:
  @HostListener('scroll', ['$event'])
  onScroll(event) {
    this._processEvent(event);
  }

  private _processEvent(event?) {
    try {
      if (!event && !this.scrollWindow) {
        console.warn(`Ignoring "window:scroll" event because the property "scrollWindow" is set to "false";`)
        return;
      }

      this._prevPerc = this._perc
      this._perc = this._getScrollingPercent(event);

      if (this._perc <= this.scrollUpTrigger && this._prevPerc > this.scrollUpTrigger) {
        this.scrollEnd.emit(SCROLL_POSITION.Top)
      }
      else if (this._perc >= this.scrollDownTrigger && this._prevPerc < this.scrollDownTrigger) {
        this.scrollEnd.emit(SCROLL_POSITION.Bottom)
      }

      //If there was an effective scroll:
      if (this._perc != this._prevPerc) {
        this.scroll.emit(this._perc); 
      }
    }
    catch (error) {
    }
  }

  private _getScrollingPercent(event?): number {

    let ret: number = 0

    if (event) {
      ret = event.target.scrollTop / (event.target.scrollHeight - event.target.offsetHeight - 1) * 100;
    }
    else {
      ret = this._calcWindowScrollPosition();
    }

    ret = (ret > 100) ? 100 : ret;
    ret = (ret < 0) ? 0 : ret;

    return ret;
  }

  private _calcWindowScrollPosition(): number {
    let scrollPosition: number = (document.documentElement.scrollTop || document.body.scrollTop);
    let scrollAreaHeight: number = (document.documentElement.scrollHeight || document.body.scrollHeight);
    let clientHeight: number = document.documentElement.clientHeight;

    //If there is a scrolling area:
    if (scrollAreaHeight > clientHeight) {
      return  (scrollPosition / (scrollAreaHeight - clientHeight)) * 100;
    }
    else {
      return 0;
    }
  }
}