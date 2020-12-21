import { EventEmitter } from "@angular/core";

export interface SearchLineInterface{

    /**
     * Trigered on every data change made to the model.
     */
    dataChanged: EventEmitter<boolean>;
}