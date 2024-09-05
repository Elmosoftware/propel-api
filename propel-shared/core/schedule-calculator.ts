import { WorkflowSchedule, ScheduleUnit, EVERY_AMOUNT_MIN, EVERY_AMOUNT_MAX, MonthlyOptionDayOfTheMonth, MonthlyOptionOrdinal } from "../models/workflow-schedule";
import { SharedSystemHelper, WeekDay } from "../utils/shared-system-helper";
import { Utils } from "../utils/utils";
import { PropelError } from "./propel-error";

type TimeOnly = { hour: number, minutes: number }

export class ScheduleCalculator {
    constructor() {
    }

    /**
     * 
     * @param schedule Schedule which validity we need to confirm
     * @returns a boolean value confirmin the schedule validity.
     */
    static isValid(schedule: WorkflowSchedule): boolean {
        if (!schedule) return false;
        if (!schedule.enabled) return true;

        if (schedule.isRecurrent) {
            if (!this.isValidEveryAmount(schedule.everyAmount)) return false;
            if (!this.parseStartingTime(schedule.startingAt)) return false;
            if (schedule.everyUnit == ScheduleUnit.Weeks && 
                (!schedule.weeklyOptions || schedule.weeklyOptions.length == 0)) return false;
        }    
        else { //Single schedule:
            if (!schedule.onlyOn) return false;
            if (!SharedSystemHelper.isValidDate(schedule.onlyOn)) return false;
        } 
        
        return true
    }

    /**
     * Returns a human friendly description of the specified Workflow schedule.
     * @param schedule A workflow schedule
     * @returns A human friendly description of the supplied workflow schedule.
     */
    static getDescription(schedule: WorkflowSchedule): string {
        let desc: string = ""
        let allWeekdays = Utils.getEnum(WeekDay)

        if (!this.isValid(schedule)) return "The schedule still incomplete or is not valid.";
        if (!schedule.enabled) return "The schedule is disabled.";

        if (schedule.isRecurrent) {
            let formattedStartingAt = SharedSystemHelper.formatDate(
                this.setStartingTime(this.parseStartingTime(schedule.startingAt)!, new Date()), "t") //Format "t" is localized time.
            desc = `Not before ${formattedStartingAt} every ${schedule.everyAmount} ${schedule.everyUnit}`

            if (schedule.everyUnit == ScheduleUnit.Weeks) {
                desc += ` on`
                schedule.weeklyOptions.sort((a, b) => a - b).
                    forEach((weekdayValue, i) => {
                        let weekday = allWeekdays.find((wd) => wd.value == weekdayValue)

                        if (weekday) {
                            desc += ((i > 0) ? ", " : " ") + weekday.key
                        }
                    })
            }

            if (schedule.everyUnit == ScheduleUnit.Months) {
                desc += ` the ${schedule.monthlyOption.ordinal}`

                if (schedule.monthlyOption.day == MonthlyOptionDayOfTheMonth["Day of the Month"]) {
                    desc += ` day of the month` 
                }
                else { //Is a weekday:
                    let weekday = allWeekdays.find((wd) => wd.value == schedule.monthlyOption.day)

                    if (weekday) {
                        desc += " " + weekday.key
                    }
                }
            }
        }
        else { //Single execution schedule:
            desc = `Only once on ` + SharedSystemHelper.formatDate(schedule.onlyOn!)
        }

        return desc + ".";
    }


    /**
     * Returns the next execution date for the given schedule. If the schedule is invalid 
     * or there is not a next execution, a null value will be returned.
     * @param schedule Schedule
     * @returns A Date object with the time for the next execution if the schedule 
     * is valid, otherwise a null value.
     */
    static getNextRun(schedule: WorkflowSchedule): Date | null {
        if (!this.isValid(schedule)) return null

        if (schedule.isRecurrent) {
            return this.getNextRecurrentSchedule(schedule);
        }
        else {
            return this.getNextSingleSchedule(schedule);
        }
    }

    private static getNextSingleSchedule(schedule: WorkflowSchedule): Date | null {
        if (schedule.lastExecution !== null && 
            SharedSystemHelper.isAfter(schedule.lastExecution, schedule.onlyOn!)) return null;

        return schedule.onlyOn;
    }

    private static getNextRecurrentSchedule(schedule: WorkflowSchedule): Date | null {

        switch (schedule.everyUnit) {
            case ScheduleUnit.Minutes:
                return this.getNextRecurrentLessThanWeeksSchedule(schedule, 1);
            case ScheduleUnit.Hours:
                return this.getNextRecurrentLessThanWeeksSchedule(schedule, 60);
            case ScheduleUnit.Days:
                return this.getNextRecurrentLessThanWeeksSchedule(schedule, 60 * 24, true);
            case ScheduleUnit.Weeks:
                return this.getNextRecurrentWeeksSchedule(schedule)
            case ScheduleUnit.Months:
                return this.getNextRecurrentMonthsSchedule(schedule)
            default:
                throw new PropelError(`No ScheduleUnit defined with name "${schedule.everyUnit}".`)
        }
    }

    private static getNextRecurrentLessThanWeeksSchedule(schedule: WorkflowSchedule,
        amountModifier: number, patchStartingTime: boolean = false): Date | null {
        let next: Date;

        if (schedule.lastExecution) {
            next = SharedSystemHelper.addMinutes(schedule.everyAmount * amountModifier,
                schedule.lastExecution)
        }
        else {
            next = new Date(schedule.creationTS);
        }

        if (!schedule.lastExecution || patchStartingTime) {
            next = this.setStartingTime(this.parseStartingTime(schedule.startingAt)!, next)
        }
        
        if (!schedule.lastExecution && SharedSystemHelper.isBefore(next, schedule.creationTS)) {
            next = SharedSystemHelper.addDays(1, next)
        }
        
        return next;
    }

    private static getNextRecurrentWeeksSchedule(schedule: WorkflowSchedule): Date | null {
        let creationTSWeekday: WeekDay = SharedSystemHelper.getWeekDay(schedule.creationTS)
        let sortedWeeklyOptions: number[] = schedule.weeklyOptions.sort((a, b) => a - b)
        let parsedStartingAt: TimeOnly = this.parseStartingTime(schedule.startingAt)!
        let lastExecWeekDay: WeekDay;
        let nextExecWeekDay: WeekDay | undefined;
        let nextDate: Date;

        if (schedule.lastExecution) {
            lastExecWeekDay = SharedSystemHelper.getWeekDay(schedule.lastExecution); //Week day of last exec.
            nextExecWeekDay = sortedWeeklyOptions.find((wd) => wd > lastExecWeekDay) //Next Weekday to 
            //exec on this week, (if any). 

            //If there is another pending execution for this week:
            if (nextExecWeekDay) {
                //Getting next execution of this week:
                nextDate = SharedSystemHelper.addDays(nextExecWeekDay - lastExecWeekDay, schedule.lastExecution)
            }
            else {
                //Moving to same day as last execution but "everyAmount" weeks in the future:
                nextDate = SharedSystemHelper.addDays(schedule.everyAmount * 7, schedule.lastExecution);
                //Setting the first date of that week:
                nextDate = SharedSystemHelper.getFirstDayOfWeek(nextDate);
                //Which is the first Day of the week that we have scheduled an execution?
                //Getting the date of the first execution this week:
                nextDate = SharedSystemHelper.addDays(sortedWeeklyOptions[0] - WeekDay.Monday, nextDate)
            }
        }
        else {
            //Found the next weekday on this week we must execute:

            let creationTimeOnly: TimeOnly = this.parseStartingTime(
                SharedSystemHelper.formatDate(schedule.creationTS, "HH:mm"))!

            //If schedule creation is after the configured startingAt, we need to exclude the 
            //schedule creation weekday:
            if (creationTimeOnly.hour > parsedStartingAt.hour || 
                (creationTimeOnly.hour == parsedStartingAt.hour && 
                creationTimeOnly.minutes > parsedStartingAt.minutes)) {
                nextExecWeekDay = schedule.weeklyOptions.find((wd) => wd > creationTSWeekday)
            }
            else {
                nextExecWeekDay = schedule.weeklyOptions.find((wd) => wd >= creationTSWeekday)
            }

            //If we must execute this week:
            if (nextExecWeekDay) {
                nextDate = SharedSystemHelper.addDays(nextExecWeekDay - creationTSWeekday, 
                    schedule.creationTS)
            }
            else {
                //Moving to the first day of the next week that is in the weekly options:
                nextDate = SharedSystemHelper.addDays(
                    (schedule.everyAmount * 7) - creationTSWeekday + sortedWeeklyOptions[0], 
                    schedule.creationTS)
            }
        }

        //Setting the hour and minutes configured in the schedule:        
        nextDate = this.setStartingTime(parsedStartingAt, nextDate)

        //If the schedule was never executed and the calculated date is in the past, we need to 
        //move the date to next week:
        if (schedule.lastExecution == null && SharedSystemHelper.isBefore(nextDate, schedule.creationTS)) {
            nextDate = SharedSystemHelper.addDays(7, nextDate)
        }

        return nextDate;
    }

    private static getNextRecurrentMonthsSchedule(schedule: WorkflowSchedule): Date | null {
        let nextDate: Date = new Date(schedule.creationTS);
        let ordinalInd: number = this.getOrdinalInd(schedule.monthlyOption.ordinal);

        //If it was executed at least one time, we need to move to the next scheduled ocurrence:
        if (schedule.lastExecution) {
            nextDate = SharedSystemHelper.addMonths(schedule.everyAmount, schedule.lastExecution)
        }

        if (schedule.monthlyOption.day == MonthlyOptionDayOfTheMonth["Day of the Month"]) {
            if (ordinalInd > 0) {
                nextDate.setDate(ordinalInd) //Setting as Day the 1st, 2nd, 3rd, etc.
            }
            else {
                //Setting the execution to the last day of the month.:
                nextDate = SharedSystemHelper.getLastDayOfMonth(nextDate);
            }
        }
        else { //Is a weekday!
            //Returning below the nth Weekday of the month. If ordinalId is less than 0, means 
            //to get the last occurrence of Weekday in the month, so we are setting the value
            //to 5, because the method will return the last if there is no 5th ocurrence:
            nextDate = SharedSystemHelper.getNthWeekDay(nextDate,
                schedule.monthlyOption.day as unknown as WeekDay,
                (ordinalInd > 0) ? ordinalInd : 5)
        }

        //Setting the hour and minutes configured in the schedule:        
        nextDate = this.setStartingTime(this.parseStartingTime(schedule.startingAt)!, nextDate)

        //If the schedule was never executed and the calculated date is in the past, we need to 
        //move the date to next month:
        if (schedule.lastExecution == null && SharedSystemHelper.isBefore(nextDate, schedule.creationTS)) {
            nextDate = SharedSystemHelper.addMonths(1, nextDate)

            //If the schedule is for a specific weekday, we need to move the date to that weekday:
            if (schedule.monthlyOption.day !== MonthlyOptionDayOfTheMonth["Day of the Month"]) {
                nextDate = SharedSystemHelper.getNthWeekDay(nextDate,
                    schedule.monthlyOption.day as unknown as WeekDay,
                    (ordinalInd > 0) ? ordinalInd : 5)
            }
        }

        return nextDate;
    }

    private static getOrdinalInd(ordinal: MonthlyOptionOrdinal): number {
        switch (ordinal) {
            case MonthlyOptionOrdinal.First:
                return 1;
            case MonthlyOptionOrdinal.Second:
                return 2;
            case MonthlyOptionOrdinal.Third:
                return 3;
            case MonthlyOptionOrdinal.Fourth:
                return 4;
            case MonthlyOptionOrdinal.Last:
                return -1;
            default:
                throw new PropelError(`No MonthlyOptionOrdinal defined with name "${ordinal}".`)
        }
    }

    private static parseStartingTime(startingAt: string): TimeOnly | null {
        const sep: string = ":"
        let timeArr: string[];
        let time: TimeOnly;
        
        if (typeof startingAt !== "string") return null;
        timeArr = startingAt.split(sep);
        if (timeArr.length !== 2) return null;
        if (!timeArr[0] || String(timeArr[0]) == "") return null;
        if (!timeArr[1] || String(timeArr[1]) == "") return null;
        if (isNaN(Number(timeArr[0])) || isNaN(Number(timeArr[1]))) return null;

        time = {
            hour: Number(timeArr[0]),
            minutes: Number(timeArr[1])
        }

        if (time.hour < 0 || time.hour > 23) return null;
        if (time.minutes < 0 || time.minutes > 59) return null;

        return time;
    }

    private static isValidEveryAmount(everyAmount: number): boolean {
        if (isNaN(everyAmount)) return false;
        if (everyAmount < EVERY_AMOUNT_MIN) return false;
        if (everyAmount > EVERY_AMOUNT_MAX) return false;

        return true;
    }

    private static setStartingTime(time: TimeOnly, date: Date = new Date()): Date {
        date.setHours(time.hour, time.minutes, 0, 0);
        return date;
    }
}