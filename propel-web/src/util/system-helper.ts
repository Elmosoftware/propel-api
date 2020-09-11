import { PropelAppError } from "../core/propel-app-error";
import { generate } from "shortid";
import * as moment from 'moment';

const DEFAULT_DATE_FORMAT: string = "dddd, MMMM Do YYYY, h:mm:ss a [(]ZZ[)]";
const DEFAULT_DURATION_FORMAT: string = "HH:mm:ss";

/**
 * File System utilities.
 */
export class SystemHelper {

    constructor(){
    }

    /**
     * Returns a Base64 encoding of the supplied ASCII string.
     * @param ASCIIString String value to be Base64 encoded.
     */
    static encodeBase64(ASCIIString: string): string{
        
        if (typeof ASCIIString !== "string") {
            throw new PropelAppError(`We expect a "string" for the parameter "ASCIIString". Supplied value type: "${typeof ASCIIString}".`)
        }
  
        return window.btoa(ASCIIString);
    }
    
    /**
     * Decodes the provided Base64 encoded string.
     * @param base64String String value to be decoded.
     */
    static decodeBase64(base64String: string): string{
        
        if (typeof base64String !== "string") {
            throw new PropelAppError(`We expect a "string" for the parameter "base64String". Supplied value type: "${typeof base64String}".`)
        }
  
        return window.atob(base64String);
    }

    /**
     * Returns a short and unique identifier.
     */
    static getUniqueId(): string{
        return generate();
    }

    /**
     * This is a wrapper for "moment().fromNow()" method.
     * It returns a human friendly string indicating how much time past or is left between 
     * the specified date and the current one.
     * Like: "2 hours ago" or "In 1 week".
     * @param date Comparison date.
     */
    static getFriendlyTimeFromNow(date: Date): string{
        return moment(date).fromNow();
    }

    /**
     * Returns a Boolean value that indicates if the provided date is valid.
     * @param date A Date object or a string compatible date.
     */
    static isValidDate(date: Date | string): boolean {
        return moment(date).isValid();
    }

    /**
     * Format the supplied date. If the date is invalid, an empty string will be returned.
     * @param date A Date object or a string compatible date
     * @param format Date format, if not supplied a default format will be used.
     */
    static formatDate(date: Date | string, format?: string): string {
        let ret: string = "";

        if (!format) {
            format = DEFAULT_DATE_FORMAT;
        }

        if (this.isValidDate(date)) {
            ret = moment(date).format(format);
        }

        return ret;
    }

    /**
     * Returns the duration or time elapsed between start and end dates.
     * @param start A Date object or a string compatible date
     * @param end A Date object or a string compatible date
     * @param format Date format, if not supplied a default format will be used.
     */
    static getDuration(start: Date | string, end: Date | string, format?: string): string{

        let ret: string = "";

        if (!format) {
            format = DEFAULT_DURATION_FORMAT;
        }

        if (this.isValidDate(start) && this.isValidDate(end)) {
            let s = moment(start);
            let e = moment(end);
            let diff = e.diff(s, "milliseconds");
            ret = moment()
                .startOf('day')
                .milliseconds(diff)
                .format(format);
        }

        return ret;
    }

    /**
     * Returns a user friendly duration, e.g.: "2 minutes", "1 hour and a half", etc.
     * @param start A Date object or a string compatible date
     * @param end A Date object or a string compatible date
     * @param format Date format, if not supplied a default format will be used.
     */
    static getFriendlyDuration(start: Date | string, end: Date | string, format?: string): string{

        let ret: string = "";
        let splitDuration: string[] = [];

        if (!format) {
            format = DEFAULT_DURATION_FORMAT;
        }

        splitDuration = this.getDuration(start, end, format)
            .split(":");

        if (splitDuration.length == 3) {
            ret = moment.duration({
                hours: Number(splitDuration[0]), 
                minutes: Number(splitDuration[1]), 
                seconds: Number(splitDuration[2])
            }).humanize();
        }

        return ret;
    }
}
