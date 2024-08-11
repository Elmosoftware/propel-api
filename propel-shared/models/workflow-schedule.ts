import { WeekDay } from "../utils/shared-system-helper";

/**
 * Minimum value for the schedule "everyAmount" attribute.
 */
export const EVERY_AMOUNT_MIN: number = 1

/**
 * Maximum value for the schedule "everyAmount" attribute.
 */
export const EVERY_AMOUNT_MAX: number = 60

/**
 * Represents any day of the month. Used in the workflow schedule monthly options.
 */
export enum MonthlyOptionDayOfTheMonth {
    "Day of the Month" = 0
}

/**
 * Workflow schedule units for recurrent schedules.
 */
export enum ScheduleUnit {
    Minutes = "Minutes",
    Hours = "Hours",
    Days = "Days",
    Weeks = "Weeks",
    Months = "Months"
}

/**
 * Workflow schedule options used in monthly recurrent schedules.
 */
export enum MonthlyOptionOrdinal {
    First = "First",
    Second = "Second",
    Third = "Third",
    Fourth = "Fourth",
    Last = "Last"
}

/**
 * Workflow schedule monthly options.
 */
export type WorkflowScheduleMonthlyOption = { ordinal: MonthlyOptionOrdinal, day: WeekDay | MonthlyOptionDayOfTheMonth }

/**
 * This class represents a Workflow schedule.
 */
export class WorkflowSchedule {

    constructor() {
        let d = new Date()
        this.startingAt = d.getHours().toString().padStart(2, "0") +
            ":" + d.getMinutes().toString().padStart(2, "0")
    }

    /**
     * Indicates if the schedule is active or not.
     */
    public enabled: boolean = false;

    /**
     * Indicates if the schedule will be repeated on time or if just will be execute a single time.
     */
    public isRecurrent: boolean = false;

    /**
     * For a single time execution, this will hold the date and time scheduled.
     */
    public onlyOn: Date | null = null;

    /**
     * Represents the amount of time units must be between recurrent executions.
     */
    public everyAmount: number = EVERY_AMOUNT_MIN;

    /**
     * Unit of time used for recurrent executions.
     */
    public everyUnit: ScheduleUnit = ScheduleUnit.Days;

    /**
     * Weekly options to set for recurrent executions when the schedule unit is "Weeks".
     */
    public weeklyOptions: WeekDay[] = [];

    /**
     * Monthly options to set for recurrent executions when the schedule unit is "Months".
     */
    public monthlyOption: WorkflowScheduleMonthlyOption = {
        ordinal: MonthlyOptionOrdinal.First,
        day: MonthlyOptionDayOfTheMonth["Day of the Month"]
    };

    /**
     * Time of the day the recurrent execution must be started.
     */
    public startingAt: string;

    /**
     * Date and time of the last execution.
     */
    public lastExecution: Date | null = null;
}