import { EventEmitter } from "@angular/core";
import { UIHelper } from "src/util/ui-helper";
import { AuditedEntity } from "../../../propel-shared/models/audited-entity";
import { Utils } from "../../../propel-shared/utils/utils";

export class SearchLine {

    /**
     * The data to be represented in the line.
     */
     model!: AuditedEntity[];

     /**
      * Trigered on every data change made to the model.
      */
     dataChanged!: EventEmitter<boolean>;

     /**
      * Search term
      */
     term!: string;


    constructor() {
    }

    getText(text: string, showPartial: boolean = false): string {
        let words: string[];
        if (!this.term) return text;
        words = Utils.removeQuotes(this.term).split(" ");
        return UIHelper.highlighText(text, words, (showPartial) ? 30 : undefined);
    }

    getLastUpdate(item: AuditedEntity): string {
        return UIHelper.getLastUpdateMessage(item, true)
    }

    getLastUpdateTooltip(item: AuditedEntity): string {
        return UIHelper.getLastUpdateMessage(item, false)
    }
}