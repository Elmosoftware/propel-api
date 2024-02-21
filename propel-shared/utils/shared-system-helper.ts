import ShortUniqueId from "short-unique-id";
import { DateTime } from "luxon";

import { PropelError } from "../core/propel-error";

const DEFAULT_ID_LENGTH: number = 14;
const DEFAULT_DATE_FORMAT: string = "cccc, LLLL d yyyy, h:mm:ss a (ZZ)";
const DEFAULT_TIME_FORMAT: string = "hh:mm:ss";
const DEFAULT_FRIENDLY_TIME_FORMAT: string = "h 'hours,' m 'minutes and' s 'seconds.'";

/**
 * File System utilities.
 */
export class SharedSystemHelper {

    constructor(){
    }

    /**
     * Returns a short and unique identifier.
     */
     static getUniqueId(length: number = DEFAULT_ID_LENGTH): string{
        let uid = new ShortUniqueId({ length: length})
        return uid();
    }

    /**
     * Returns a Base64 encoding of the supplied ASCII string.
     * @param ASCIIString String value to be Base64 encoded.
     */
    static encodeBase64(ASCIIString: string): string{
        
        if (typeof ASCIIString !== "string") {
            throw new PropelError(`We expect a "string" for the parameter "ASCIIString". Supplied value type: "${typeof ASCIIString}".`)
        }
  
        return window.btoa(ASCIIString);
    }
    
    /**
     * Decodes the provided Base64 encoded string.
     * @param base64String String value to be decoded.
     */
    static decodeBase64(base64String: string): string{
        
        if (typeof base64String !== "string") {
            throw new PropelError(`We expect a "string" for the parameter "base64String". Supplied value type: "${typeof base64String}".`)
        }
  
        return window.atob(base64String);
    }

    /**
     * This is a wrapper for "moment().fromNow()" method.
     * It returns a human friendly string indicating how much time past or is left between 
     * the specified date and the current one.
     * Like: "2 hours ago" or "In 1 week".
     * @param date Comparison date.
     */
    static getFriendlyTimeFromNow(date: Date | string): string{
        let dt: DateTime = this.getDateTime(date)
        
        if (!dt.isValid) return "" 
        else return dt.toRelative() ?? ""
    }

    /**
     * Returns a Boolean value that indicates if the provided date is valid.
     * @param date A Date object or a string compatible date.
     */
    static isValidDate(date: Date | string): boolean {
        return this.getDateTime(date).isValid;
    }

    /**
     * Evaluates the providade value and returns true if is a valid numeric value.
     * @param n Number or String to validate
     * @returns A boolean value indicating if the supplied value can be considered as a literal number.
     */
    static isValidNumber(n: number | string): boolean {
        if(typeof n == "number") return true;
        return n.trim() !== "" && !isNaN(Number(n))
    }

    /**
     * If the date is valid, this is going to return the [ISO-8601 date representation](https://www.iso.org/iso-8601-date-and-time-format.html).
     * This full representation of a date has the following format:
     * @example
     *      2022-09-12T00:00:00.000-03:00
     * @param date Date object or Date string representation to convert.
     * @returns ISO string representing the provided date or an empty string if the preoviced date
     * is invalid.
     */
    static toISOFormat(date: Date | string): string {
        let dt: DateTime = this.getDateTime(date)
        
        if (!dt.isValid) return "" 
        else return dt.toUTC().toISO({ includeOffset: true })
    }

    /**
     * Format the supplied date. If the date is invalid, an empty string will be returned.
     * @param date A Date object or a string compatible date
     * @param format Date format, if not supplied a default format will be used.
     */
    static formatDate(date: Date | string, format?: string): string {
        let dt: DateTime = this.getDateTime(date)

        if (!format) {
            format = DEFAULT_DATE_FORMAT;
        }

        if (!dt.isValid) return ""
        else return dt.toFormat(format)
    }

    /**
     * Returns the duration or time elapsed between start and end dates.
     * @param start A Date object or a string compatible date
     * @param end A Date object or a string compatible date
     * @param format Date format, if not supplied a default format will be used.
     */
    static getDuration(start: Date | string, end: Date | string, format?: string): string{
        let dtStart: DateTime = this.getDateTime(start)
        let dtEnd: DateTime = this.getDateTime(end)

        if(!dtStart.isValid || !dtEnd.isValid) return ""

        if (!format) {
            format = DEFAULT_TIME_FORMAT;
        }

        return dtEnd.diff(dtStart).toFormat(format);
    }

    /**
     * Returns a user friendly duration, e.g.: "2 minutes", "1 hour and a half", etc.
     * @param start A Date object or a string compatible date
     * @param end A Date object or a string compatible date
     * @param format Date format, if not supplied a default format will be used.
     */
    static getFriendlyDuration(start: Date | string, end: Date | string): string{
        return this.getDuration(start, end, DEFAULT_FRIENDLY_TIME_FORMAT);
    }

    /**
     * Add the specified amount of minutes to the specified date.
     * @param minutes Minutes to add or subtract, (if the value is negative).
     * @param date Date to wich we are add the minutes. If not specified, current date and time will be used.
     */
    static addMinutes(minutes: number, date = new Date()): Date {
        return this.getDateTime(date)
            .plus({ minutes: minutes })
            .toJSDate()
    }

    private static getDateTime(d: Date | string): DateTime {
        let ret: DateTime

        if (typeof d == "string") {
            ret = DateTime.fromISO(d)
        }
        else {
            ret = DateTime.fromJSDate(d)
        }
        
        return ret;
    }
}
