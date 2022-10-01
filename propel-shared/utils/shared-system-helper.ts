/**
 * IMPORTANT:
 * ==========
 *      There is an open [nanoid issue](https://github.com/ai/nanoid/issues/365) that is 
 * preventing v4 or above to work on Node.JS. Take this in mind at the moment of think in a 
 * possible migration.
 */
import { nanoid } from "nanoid";
import * as moment from 'moment';

import { PropelError } from "../core/propel-error";

const DEFAULT_ID_LENGTH: number = 14;
const DEFAULT_DATE_FORMAT: string = "dddd, MMMM Do YYYY, h:mm:ss a [(]ZZ[)]";
const DEFAULT_TIME_FORMAT: string = "HH:mm:ss";

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
        return nanoid(length);
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
    static getFriendlyTimeFromNow(date: Date): string{
        return moment.default(date).fromNow();
    }

    /**
     * Returns a Boolean value that indicates if the provided date is valid.
     * @param date A Date object or a string compatible date.
     */
    static isValidDate(date: Date | string): boolean {
        return moment.default(date).isValid();
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
        if(!this.isValidDate(date)) return ""
        else return moment.default(date).toISOString();
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
            ret = moment.default(date).format(format);
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
            format = DEFAULT_TIME_FORMAT;
        }

        if (this.isValidDate(start) && this.isValidDate(end)) {
            let s = moment.default(start);
            let e = moment.default(end);
            let diff = e.diff(s, "milliseconds");
            ret = moment.default()
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
            format = DEFAULT_TIME_FORMAT;
        }

        splitDuration = this.getDuration(start, end, format)
            .split(":");

        if (splitDuration.length == 3) {
            ret = moment.default.duration({
                hours: Number(splitDuration[0]), 
                minutes: Number(splitDuration[1]), 
                seconds: Number(splitDuration[2])
            }).humanize();
        }

        return ret;
    }

    /**
     * Add the specified amount of minutes to the specified date.
     * @param minutes Minutes to add or subtract, (if the value is negative).
     * @param date Date to wich we are add the minutes. If not specified, current date and time will be used.
     */
    static addMinutes(minutes: number, date = new Date()): Date {
        return moment.default(date).add(minutes, "minutes").toDate();
    }
}
