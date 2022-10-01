import * as stemmer from 'stemmer';
import { removeStopwords } from 'stopword';

import { SharedSystemHelper } from '../../../propel-shared/utils/shared-system-helper';
import { WorkflowStep } from '../../../propel-shared/models/workflow-step';
import { ExecutionStep } from '../../../propel-shared/models/execution-step';
import { ParameterValue } from '../../../propel-shared/models/parameter-value';
import { AuditedEntity } from "../../../propel-shared/models/audited-entity";

/**
 * UI Helper class.
 */
export class UIHelper {

    constructor() {
    }


    /**
     * Returns a comma separated list of target names at least the "useFQDN" is specified.
     * @param useFQDN If true, the list is going to contain target FQDN's, otherwise it will 
     * return the friendly names.
     */
    static getTargetList(step: WorkflowStep | ExecutionStep, useFQDN: boolean = false): string {

        let ret: string = "None";

        if (step.targets && step.targets.length > 0) {
            ret = (step.targets as any[])
                .map((t: any) => {
                    if (useFQDN) return t.FQDN;
                    else return (t.friendlyName) ? t.friendlyName : t.name;
                })
                .join();
        }

        return ret;
    }

    /**
     * Return a userfriendly list of parameter values.
     * @param values parameter values.
     */
    static getParameterValuesList(values: ParameterValue[]): string {
        let ret: string = "None";

        if (values && values.length > 0) {
            ret = values.map((pv: ParameterValue) => {
                let quotes: string = (pv.nativeType == "String") ? `"` : "";
                return `${pv.name} = ${quotes}${pv.value}${quotes}`;
            })
                .join();
        }

        return ret;
    }

    /**
     * Applies a tokenization and stemming process of the supplied string and returns a list of words.
     * @param s string to be tokenized and stemmed.
     */
    static tokenizeAndStem(s: string): string[] {
        let ret: string[] = [];

        if (s && typeof s == "string") {
            //Text tokenization: we will return all words that have at least 2 chars long:
            ret = s.split(" ")
                .filter((item) => item.trim().length > 1);
            //Removing stop words from the list:
            ret = removeStopwords(ret)
            //Stemming words:
            ret = ret
                .map((word) => {
                    let stemmed = stemmer.default(word);
                    //We will keep the stemmed version only if is varying in length.
                    return (stemmed.length != word.length) ? stemmed : word;
                })
        }

        return ret;
    }

    /**
     * Find the list of words supplied in the text value and add a defined prefix and suffix to each word. Overlapped words are managed 
     * keeping only the longest match.
     * e.g: If we look for "Monday" and "Today is Monday" and there is a match for the second, that one will prevail.
     * 
     * We can also define a chunksize, useful when we are dealing with large texts and we woould like to show just a portion of each match.
     * e.g: If we have the text "Summer surprised us, coming over the Starnbergersee With a shower of rain; we stopped in the colonnade"
     * And we have to find matches for word "starnbergersee" with a chunksize of 30 characters the result will be:
     *                      &hellip;oming over the <mark>Starnbergersee</mark> With a shower &hellip;
     * Please remind that searches are case insensitive.
     * @param text text to higlight.
     * @param words Listof words to searh for.
     * @param chunkSize This is the total portion of the text that we are going to show at both sides of each match.
     * @param prefix Text to add at the left side of a matched word, by default will be a mark HTML tag, ("<mark>").
     * @param suffix Text to add at the right side of a matched word, by default will be a mark HTML closing tag, ("</mark>").
     * @param chunkSeparator If chunksize is defined, it will be the character to use at the beginning and end of each chunk. by default 
     * will be the Horizontal ellipsis HTML symbol, ("&hellip;").  
     */
    static highlighText(text: string, words: string[], chunkSize: number = 0, prefix: string = `<mark>`,
        suffix: string = `</mark>`, chunkSeparator: string = "&hellip;"): string {

        let allMatches: any[] = [];
        let chunks: string[] = [];

        if (!text || !words || words.length == 0) return "";

        //From now on we will refer as "chunk size" as the left or right portion between a match and the previous or next one:
        chunkSize = Math.round(chunkSize / 2);

        //We sort the words by his length in descending order:
        words = words
            .sort((a, b) => {
                return b.length - a.length
            });

        words.forEach((word: string) => {
            let reg = new RegExp(word, "gi");
            let match: any;

            while ((match = reg.exec(text)) !== null) {
                match = {
                    word: word,
                    s: match.index,
                    e: reg.lastIndex - 1
                }

                //If this match is about to overlap in some way another already existing, we will 
                //discard it:
                if (!allMatches.find((item) => {
                    //                                                           item.s      item.e
                    //                                                              |           |
                    return (match.s <= item.s && match.e >= item.s)  //Overlap 1: |   | 
                        || (match.s >= item.s && match.e <= item.e)  //Overlap 2:      |   |
                        || (match.s <= item.e && match.e >= item.e)  //Overlap 3:            |     |
                        || (match.s <= item.s && match.e >= item.e); //Overlap 4: |                   |
                })) {
                    allMatches.push(match);
                }
            }
        })

        //We now sort all the found matches by the start position: 
        allMatches = allMatches
            .sort((a, b) => {
                return a.s - b.s;
            });

        allMatches.forEach((match, i: number) => {
            let offset: number = (prefix.length + suffix.length) * i;

            text = text.substring(0, match.s + offset) +
                prefix + text.substring(match.s + offset, match.e + offset + 1) + suffix +
                text.substring(match.e + offset + 1);
            
            //We update start and end of the match to include prefix. In this way will be easier to calculate the chunks:
            match.s = match.s + offset;
            match.e = match.s + prefix.length + match.word.length + suffix.length; 

            if (chunkSize > 0) {
                let chunk: any = {
                    s: 0,
                    e: text.length
                }
                let previousChunk: any = (chunks.length > 0) ? chunks[chunks.length - 1] : null;

                //Calculating end of chunk:
                chunk.e = (match.e + chunkSize < text.length) ? match.e + chunkSize : text.length;

                //Calculating start of chunk:
                if (previousChunk) {
                    //If there is no overlapping with the previous chunk:
                    if (match.s - chunkSize > previousChunk.e) {
                        chunk.s = match.s - chunkSize;
                    }
                    else {
                        //If there is overlapping: This chunk is no longer valid, we just need to extend the previous chunk:
                        previousChunk.e = chunk.e;
                        chunk = null;
                    }
                }
                else { //If there is no previous chunk:
                    chunk.s = (match.s - chunkSize > 0) ? match.s - chunkSize : 0;
                }

                if (chunk) {
                    chunks.push(chunk);
                }
            }
        });

        if (chunks.length > 0) {
            let chunkedText: string = "";

            chunks.forEach((chunk: any) => {
                chunkedText += ((chunkedText.length > 0) ? " " : "") + ((chunk.s > 0) ? chunkSeparator : "") +
                    text.substring(chunk.s, chunk.e) + ((chunk.e < text.length) ? chunkSeparator : "");
            })

            text = chunkedText;
        }
        
        return text;
    }

    /**
     * Returns a shortened version of the supplied text.
     * @param text Test  to be shortened.
     * @param startPosition Positions of first character to show, default will be the beginning.
     * @param maxLength Total numbers of characters to show, default will be 150.
     * @param posfix the posfix or string terminator to add at the end. Default will be "..." html entity "&hellip;".
     */
    static getShortText(text: string, startPosition: number = 0, maxLength: number = 150, posfix: string = "&hellip;") {
        return (text && text.length > maxLength) ? text.substr(startPosition, maxLength - 1) + '&hellip;' : text;
    }

    /**
     * For an audited entity object, return the last modification date as an exact date or as a friendly date.
     * @example
     *     getLastUpdateMessage(obj) //"Last modified a month ago"
     *     getLastUpdateMessage(obj, false) //"Last modified Sunday, February 27th 2022, 9:21:03 am (-0300)"
     *     getLastUpdateMessage(obj, false, "My prefix") //"My prefix Sunday, February 27th 2022, 9:21:03 am (-0300)"
     * @param item Audited entity
     * @param friendly If we must return a friendly data like "2 hours ago" or "the past month".
     * @param prefix Prefix text to add to the returned value.
     * @returns The last update or the creation date in the specified format.
     * If the supplied AuditedEntity object does not contain the properties "lastUpdateOn" 
     * and "createdOn" or they are not set, this method will return an empty string.
     */
    static getLastUpdateMessage(item: AuditedEntity, friendly: boolean = true, prefix: string = "Last modified"): string {
        let ret: string = "";
        let lastUpdate: Date;
        let lastUser: string;

        if (!item || item.lastUpdateOn === undefined || item.createdOn === undefined) return ret
        
        lastUpdate = (item.lastUpdateOn) ? item.lastUpdateOn : item.createdOn;
        lastUser = (item.lastUpdateBy) ? item.lastUpdateBy : item.createdBy;
    
        if (friendly) {
          ret = SharedSystemHelper.getFriendlyTimeFromNow(lastUpdate);
        }
        else {
          ret = SharedSystemHelper.formatDate(lastUpdate);
        }
    
        return `${prefix} ${ret} ${(lastUser) ? "by " + lastUser : ""}`;
      }
}