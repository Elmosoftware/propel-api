import ShortUniqueId from "short-unique-id";
import { DateTime } from "luxon";

import { PropelError } from "../core/propel-error";

const DEFAULT_ID_LENGTH: number = 14;
const DEFAULT_DATE_FORMAT: string = "cccc, LLLL d yyyy, h:mm:ss a (ZZ)";
const DEFAULT_TIME_FORMAT: string = "hh:mm:ss";
const DEFAULT_FRIENDLY_TIME_FORMAT: string = "h 'hours,' m 'minutes and' s 'seconds.'";

/**
 * Represents the days of the week.
 */
export enum WeekDay {
    Monday = 1,
    Tuesday = 2,
    Wednesday = 3,
    Thursday = 4,
    Friday = 5,
    Saturday = 6,
    Sunday = 7
}

/**
 * File System utilities.
 */
export class SharedSystemHelper {

    constructor() {
    }

    /**
     * Returns a short and unique identifier.
     */
    static getUniqueId(length: number = DEFAULT_ID_LENGTH): string {
        let uid = new ShortUniqueId({ length: length })
        return uid();
    }

    /**
     * Returns a Base64 encoding of the supplied ASCII string.
     * @param ASCIIString String value to be Base64 encoded.
     * @throws PropelError if the parameter type is not a string value.
     */
    static encodeBase64(ASCIIString: string): string {

        if (typeof ASCIIString !== "string") {
            throw new PropelError(`We expect a "string" for the parameter "ASCIIString". Supplied value type: "${typeof ASCIIString}".`)
        }

        return window.btoa(ASCIIString);
    }

    /**
     * Decodes the provided Base64 encoded string.
     * @param base64String String value to be decoded.
     * @throws PropelError if the parameter type is not a string value.
     */
    static decodeBase64(base64String: string): string {

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
    static getFriendlyTimeFromNow(date: Date | string): string {
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
    static getDuration(start: Date | string, end: Date | string, format?: string): string {
        let dtStart: DateTime = this.getDateTime(start)
        let dtEnd: DateTime = this.getDateTime(end)

        if (!dtStart.isValid || !dtEnd.isValid) return ""

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
    static getFriendlyDuration(start: Date | string, end: Date | string): string {
        return this.getDuration(start, end, DEFAULT_FRIENDLY_TIME_FORMAT);
    }

    /**
     * Add the specified amount of minutes to the specified date.
     * @param minutes Minutes to add or subtract, (if the value is negative).
     * @param date Date to wich we are add the minutes. If not specified, current date and time will be used.
     * @throws PropelError if the parameter minutes is not a number.
     * @throws PropelError if parameter date is an invalid date.
     */
    static addMinutes(minutes: number, date: Date | string = new Date()): Date {
        let d: DateTime = this.getDateTime(date, true);

        if (typeof minutes !== "number") {
            throw new PropelError(`We expect a "number" type for the parameter "minutes". 
Supplied value type is: "${typeof minutes}".`)
        }

        return d
            .plus({ minutes: minutes })
            .toJSDate()
    }

    /**
     * Add or substract the specified amount of days to the specified date.
     * @param days Number of days to add or subtract, (if the value is negative).
     * @param date Date to wich we are add the minutes. If not specified, current date and time will be used.
     * @throws PropelError if the parameter minutes is not a number.
     * @throws PropelError if parameter date is an invalid date.
     */
    static addDays(days: number, date: Date | string = new Date()): Date {
        let d: DateTime = this.getDateTime(date, true);

        if (typeof days !== "number") {
            throw new PropelError(`We expect a "number" type for the parameter "days". 
Supplied value type is: "${typeof days}".`)
        }

        return d
            .plus({ days: days })
            .toJSDate()
    }

    /**
     * Add or substract the specified amount of months to the specified date.
     * @param months Amount of months to add to the provided date.
     * @param date Date to which we need to add months.
     * @returns A new date months ahead or before the provided date.
     */
    static addMonths(months: number, date: Date | string = new Date()): Date {
        let d: DateTime = this.getDateTime(date, true);

        if (isNaN(months)) {
            throw new PropelError(`We expect a "number" type for the parameter "months". 
Supplied value is: "${months}".`)
        }

        return d
            .plus({ months: months })
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

        if (d == null) return d
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

        if (d == null) return d
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

        if (d == null) return d
        else return Boolean(d < 0);
    }

    /**
     * This method return one possible value from the Weekdays enumeration representing the day of 
     * the week.
     * @param date Date for which the day of the week number will be returned.
     * @returns One element of the Weekday enumeration.
     * @example
     * SharedSystemHelper.getWeekDay("2024-08-07T10:00:00.000Z") ==> Weekday.Wednesday
     */
    static getWeekDay(date: Date | string): WeekDay {
        return this.getDateTime(date, true).weekday;
    }

    /**
     * Return the date corresponding to the Monday of the same week of "date". Time will be preserved.
     * @param date Any day of a week which first day we want to get.
     * @returns A date corresponding to a Monday of the same week as "date".
     * @example
     * SharedSystemHelper.getFirstDayOfWeek("2024-08-07T14:30:00.000Z") ==> new Date("2024-08-05T14:30:00.000Z")
     */
    static getFirstDayOfWeek(date: Date | string): Date {
        let d: DateTime = this.getDateTime(date, true)
        return d
            .startOf("week")
            //When calling "startOf", the time part of the date is gone, but we need to keep it:
            .set({ hour: d.hour, minute: d.minute, second: d.second, millisecond: d.millisecond })
            .toJSDate();
    }

    /**
     * Return the last date of the month of the specified date. 
     * Time will be preserved. 
     * @param date Any date of a month which last day we want to obtain.
     * @returns The last day of the month.
     * @example
     * SharedSystemHelper.getLastDayOfMonth("2024-08-07T14:30:00.000Z") ==> new Date("2024-08-31T14:30:00.000Z")
     */
    static getLastDayOfMonth(date: Date | string): Date {
        let d: DateTime = this.getDateTime(date, true)
        return d
            .endOf("month")
            //When calling "endOf", the time part of the date is updated to the last 
            //millisecond, but we need to keep it the original time of the day:
            .set({ hour: d.hour, minute: d.minute, second: d.second, millisecond: d.millisecond })
            .toJSDate();
    }

    /**
     * This return the nth weekday in the specified month.
     * @param date Any date of a month for which we would like to obtain the Nth weekday.
     * @param weekday Weekday to get the date
     * @param ordinal Ordinal of the weekday if the number is greater than the amount of occurrences 
     * of the weekday, the last one will be retrieved.
     * @returns The date corresponding to the nth weekday in the provided month
     * @example
     * //Searching for the 2nd Friday of August 2024:
     * getNthWeekDay('2024-08-11T16:24:21.000', Weekday.Friday, 2) ==> new Date("2024-08-09T16:24:21.000")
     * //Note: Date can be any date/time in the month we would like to retrieve the nth occurrence 
     * //of the weekday.
     */
    static getNthWeekDay(date: Date | string, weekday: WeekDay, ordinal: number): Date {
        let d: Date = this.getDateTime(date, true)
            .toJSDate()
        d.setDate(1) // Setting the first date of the month as reference.

        if (typeof weekday !== "number") {
            throw new PropelError(`We expect a "number" type for the parameter "weekday". 
Supplied value type is: "${typeof weekday}".`)
        }

        if (typeof ordinal !== "number") {
            throw new PropelError(`We expect a "number" type for the parameter "ordinal". 
Supplied value type is: "${typeof ordinal}".`)
        }
        else if (ordinal <= 0) {
            throw new PropelError(`We expect a numeric value greater than 0 for the parameter "ordinal". 
Supplied value is: "${ordinal}".`)
        }

        let lastDayOfMonth: number = SharedSystemHelper.getLastDayOfMonth(date).getDate();
        let firstWeekDayOfMonth: WeekDay = SharedSystemHelper.getWeekDay(d);
        let weekDayOffset: number;
        let daysToNthWeekday: number
        let maxOrdinal: number
        
        //Offset of the specified weekday in reference to the weekday of the first day of the month: 
        weekDayOffset = weekday - firstWeekDayOfMonth
        weekDayOffset = (weekDayOffset < 0) ? 7 + weekDayOffset : weekDayOffset;
        
        //Calculating the maximum ocurrences of the target weekday for this month:
        maxOrdinal = (lastDayOfMonth - weekDayOffset) / 7;
        maxOrdinal = (Math.trunc(maxOrdinal) == maxOrdinal) ? maxOrdinal : Math.trunc(maxOrdinal) + 1;
        
        //Limiting the ordinal specified to avoid overflow:
        ordinal = Math.min(ordinal, maxOrdinal)
        
        //Calculating how many days from the beginning of the month to the Nth ocurrence of weekday:
        daysToNthWeekday = (7 * (ordinal - 1)) + weekDayOffset + 1

        return SharedSystemHelper.addDays(daysToNthWeekday - 1, d)
    }

    private static getDateTime(date: Date | string, throwIfInvalid: boolean = false): DateTime {
        let ret: DateTime

        if (typeof date == "string") {
            ret = DateTime.fromISO(date)
        }
        else {
            ret = DateTime.fromJSDate(date)
        }

        if (throwIfInvalid && !ret.isValid) {
            throw new PropelError(`We expect a valid date value for parameter "date". Not able to parse 
                the value "${String(date)}" as a valid date. Invalid Reason: [${ret.invalidReason}]:${ret.invalidExplanation}`)
        }

        return ret;
    }
}
