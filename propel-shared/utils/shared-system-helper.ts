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
        else return dt.toUTC().toISO({ includeOffset: true })!
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

    /**
     * This is going to return the difference in milliseconds between both provided dates.
     * If one or both of the dates are invalid a null value will be returned.
     * If both are valid a numeric value representing the amount of milliseconds between both dates
     * will be returned in the following way:
     *   - If **"start"** is before than **"end"** the returned value will be positive.
     *   - If **"start"** is after than **"end"** the returned value will be negative.
     *   - If **"start"** is equal to **"end"** the returned value will be 0.
     * @param start A Date object or a string compatible date.
     * @param end A Date object or a string compatible date.
     * @returns The amount of milliseconds that pass between the start and the end.
     */
    static getDifference(start: Date | string, end: Date | string): number | null {
        let s: DateTime = this.getDateTime(start);
        let e: DateTime = this.getDateTime(end);

        if (s.isValid && e.isValid) {
            return e.diff(s, "milliseconds").milliseconds;
        }
        else return null;
    }

    /**
     * Returns a boolean value indicating if both dates supplied are equal dates. If some 
     * of them or both are not valid dates, a null value will be returned.
     * @param date1 First date to compare.
     * @param date2 Second Date to compare.
     * @returns A boolean value indicating if they are equal or a null value if some 
     * of them are not valid.
     */
    static isEqual(date1: Date | string, date2: Date | string): boolean | null {
        let d: number | null = this.getDifference(date1, date2);

        if (d == null)  return d
        else return Boolean(d == 0);
    }

    /**
     * Compares **"date"** with **"relativeTo"** and returns one of the possible values:
     *  - true: If **"date"** occurs before **"relativeTo"**
     *  - false: If **"date"** occurs after **"relativeTo"**
     *  - null: If **"date"** or **"relativeTo"** are invalid dates.
     * @param date Date to found if is before than the relative.
     * @param relativeTo Relative date to compare the @param date to.
     * @returns A boolean value indicating if @param date occurs before @param relativeTo or
     * a null value if some of those dates are invalid.
     */
    static isBefore(date: Date | string, relativeTo: Date | string): boolean | null {
        let d: number | null = this.getDifference(date, relativeTo);

        if (d == null)  return d
        else return Boolean(d > 0);
    }

    /**
     * Compares **"date"** with **"relativeTo"** and returns one of the possible values:
     *  - true: If **"date"** occurs after **"relativeTo"**
     *  - false: If **"date"** occurs before **"relativeTo"**
     *  - null: If **"date"** or **"relativeTo"** are invalid dates.
     * @param date Date to found if is after than the relative.
     * @param relativeTo Relative date to compare the @param date to.
     * @returns A boolean value indicating if @param date occurs before @param relativeTo or
     * a null value if some of those dates are invalid.
     */
    static isAfter(date: Date | string, relativeTo: Date | string): boolean | null {
        let d: number | null = this.getDifference(date, relativeTo);

        if (d == null)  return d
        else return Boolean(d < 0);
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
