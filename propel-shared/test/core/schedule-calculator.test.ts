import { WorkflowSchedule, ScheduleUnit, EVERY_AMOUNT_MIN, EVERY_AMOUNT_MAX, MonthlyOptionDayOfTheMonth, MonthlyOptionOrdinal } from "../../models/workflow-schedule";
import { ScheduleCalculator } from "../../core/schedule-calculator";
import { SharedSystemHelper, WeekDay } from "../../utils/shared-system-helper";

/*
import { DateTime, Settings } from "luxon";

A Note on mocking date: I tried unsuccessfully, even when mocking Luxon settings too, some of the calls
return weird responses.
This will impact some tests that need specific weekdays to run.

In the case you reader would like to review this start with the following:
https://nickjones.tech/luxon-jest-mock/
https://medium.com/@dfriyia/simple-date-testing-with-jest-and-javascript-b8091a77a933
https://codewithhugo.com/mocking-the-current-date-in-jest-tests/
https://www.benoitpaul.com/blog/javascript/jest-mock-date/

const oldGlobalDate = global.Date;
const oldLuxonSettings = Settings.now;

function mockDate(date: Date) {
    jest.spyOn(global, "Date")
        .mockImplementation(() => date as unknown as string)

    global.Date.UTC = oldGlobalDate.UTC; //For some reason UTC can't me mocked, so we need to go this way.
    Settings.now = () => date.getTime()

}
*/

describe(`ScheduleCalculator Class - isValid().`, () => {

    test('Invalid - Null schedule.', () => {
        expect(ScheduleCalculator.isValid(null as unknown as WorkflowSchedule)).toBe(false);
    });

    test('Invalid - Recurrent schedule, invalid everyAmount.', () => {
        const schedule = new WorkflowSchedule();
        schedule.enabled = true;
        schedule.isRecurrent = true;
        schedule.everyAmount = -1;
        schedule.startingAt = '08:00';

        expect(ScheduleCalculator.isValid(schedule)).toEqual(false);
    });

    test('Invalid recurrent schedule, startingAt attribute is not a string.', () => {
        const schedule = new WorkflowSchedule();
        schedule.enabled = true;
        schedule.isRecurrent = true;
        schedule.everyAmount = 1;
        schedule.startingAt = 2 as unknown as string; 

        expect(ScheduleCalculator.isValid(schedule)).toEqual(false);
    });

    test('Invalid recurrent schedule, startingAt attribute invalid format not including minutes.', () => {
        const schedule = new WorkflowSchedule();
        schedule.enabled = true;
        schedule.isRecurrent = true;
        schedule.everyAmount = 1;
        schedule.startingAt = "12:"; 

        expect(ScheduleCalculator.isValid(schedule)).toEqual(false);
    });

    test('Invalid recurrent schedule, startingAt attribute invalid format wrong separator.', () => {
        const schedule = new WorkflowSchedule();
        schedule.enabled = true;
        schedule.isRecurrent = true;
        schedule.everyAmount = 1;
        schedule.startingAt = "12;23"; 

        expect(ScheduleCalculator.isValid(schedule)).toEqual(false);
    });

    test('Invalid recurrent schedule, Invalid hours in startingAt attribute.', () => {
        const schedule = new WorkflowSchedule();
        schedule.enabled = true;
        schedule.isRecurrent = true;
        schedule.everyAmount = 1;
        schedule.startingAt = '24:00'; // Invalid hours

        expect(ScheduleCalculator.isValid(schedule)).toEqual(false);
    });

    test('Invalid recurrent schedule, Invalid minutes in startingAt attribute.', () => {
        const schedule = new WorkflowSchedule();
        schedule.enabled = true;
        schedule.isRecurrent = true;
        schedule.everyAmount = 1;
        schedule.startingAt = '18:-4'; // Invalid hours

        expect(ScheduleCalculator.isValid(schedule)).toEqual(false);
    });

    test('Invalid - Recurrent schedule, Weekly schedule, Null Weekly options.', () => {
        const schedule = new WorkflowSchedule();
        schedule.enabled = true;
        schedule.isRecurrent = true;
        schedule.everyUnit = ScheduleUnit.Weeks;
        schedule.weeklyOptions = null as unknown as WeekDay[];
        schedule.startingAt = '08:00';

        expect(ScheduleCalculator.isValid(schedule)).toEqual(false);
    });

    test('Invalid - Recurrent schedule, Weekly schedule, Empty Weekly options.', () => {
        const schedule = new WorkflowSchedule();
        schedule.enabled = true;
        schedule.isRecurrent = true;
        schedule.everyUnit = ScheduleUnit.Weeks;
        schedule.weeklyOptions = [];
        schedule.startingAt = '08:00';

        expect(ScheduleCalculator.isValid(schedule)).toEqual(false);
    });

    test('Invalid Single execution schedule, Missing onlyOn attribute value.', () => {
        const schedule = new WorkflowSchedule();
        schedule.enabled = true;
        schedule.isRecurrent = false;
        schedule.onlyOn = null;

        expect(ScheduleCalculator.isValid(schedule)).toEqual(false);
    });

    test('Invalid Single execution schedule, Missing onlyOn attribute value.', () => {
        const schedule = new WorkflowSchedule();
        schedule.enabled = true;
        schedule.isRecurrent = false;
        schedule.onlyOn = "2024-99-99T99:99:99.000" as unknown as Date;

        expect(ScheduleCalculator.isValid(schedule)).toEqual(false);
    });

    test('Valid - As new instance', () => {
        const schedule = new WorkflowSchedule();

        expect(ScheduleCalculator.isValid(schedule)).toEqual(true);
    });

    test('Valid - Disabled schedule', () => {
        const schedule = new WorkflowSchedule();
        schedule.enabled = false;

        expect(ScheduleCalculator.isValid(schedule)).toEqual(true);
    });

    test('Valid - Single execution schedule', () => {
        const schedule = new WorkflowSchedule();
        schedule.enabled = true;
        schedule.isRecurrent = false;
        schedule.onlyOn = new Date();

        expect(ScheduleCalculator.isValid(schedule)).toEqual(true);
    });

    test('Valid - Recurrent schedule Weekly', () => {
        const schedule = new WorkflowSchedule();
        schedule.enabled = true;
        schedule.isRecurrent = true;
        schedule.everyUnit = ScheduleUnit.Weeks
        schedule.weeklyOptions = [
            WeekDay.Friday
        ]

        expect(ScheduleCalculator.isValid(schedule)).toEqual(true);
    });   
})

describe(`ScheduleCalculator Class - getDescription().`, () => {

    function getLocalizedStartingAt(startingAt:string): string {
        let d: Date = new Date()
        let split = startingAt.split(":")
        d.setHours(Number(split[0]),Number(split[1]))
        return d.toLocaleTimeString([], {hour: 'numeric', minute:'2-digit', hour12: true}); //Displaying only hour s and minutes.
    }

    test('Invalid schedule', () => {
        expect(ScheduleCalculator.getDescription(null as unknown as WorkflowSchedule))
            .toBe("The schedule still incomplete or is not valid.");
    });
    
    test('Valid Disabled schedule', () => {
        const schedule = new WorkflowSchedule();
        schedule.enabled = false;

        expect(ScheduleCalculator.getDescription(schedule))
            .toBe(`The schedule is disabled.`);
    });

    test('Valid Daily recurrent schedule', () => {
        const schedule = new WorkflowSchedule();
        schedule.enabled = true;
        schedule.isRecurrent = true;
        schedule.everyUnit = ScheduleUnit.Days;
        schedule.everyAmount = 1;
        schedule.startingAt = '08:00';
    
        expect(ScheduleCalculator.getDescription(schedule))
            .toBe(`Not before ${getLocalizedStartingAt(schedule.startingAt)} every 1 Days.`);
    });
    
    test('Valid Weekly recurrent schedule with multiple days', () => {
        const schedule = new WorkflowSchedule();
        schedule.enabled = true;
        schedule.isRecurrent = true;
        schedule.everyUnit = ScheduleUnit.Weeks;
        schedule.everyAmount = 2;
        schedule.startingAt = '20:10';
        schedule.weeklyOptions = [WeekDay.Monday, WeekDay.Wednesday, WeekDay.Friday];
    
        expect(ScheduleCalculator.getDescription(schedule))
            .toBe(`Not before ${getLocalizedStartingAt(schedule.startingAt)} every 2 Weeks on Monday, Wednesday, Friday.`);
    });
    
    test('Valid Weekly recurrent schedule with single day', () => {
        const schedule = new WorkflowSchedule();
        schedule.enabled = true;
        schedule.isRecurrent = true;
        schedule.everyUnit = ScheduleUnit.Weeks;
        schedule.everyAmount = 3;
        schedule.startingAt = '17:50';
        schedule.weeklyOptions = [WeekDay.Sunday];
    
        expect(ScheduleCalculator.getDescription(schedule))
            .toBe(`Not before ${getLocalizedStartingAt(schedule.startingAt)} every 3 Weeks on Sunday.`);
    });

    test('Valid Weekly recurrent schedule including invalid day value', () => {
        const schedule = new WorkflowSchedule();
        schedule.enabled = true;
        schedule.isRecurrent = true;
        schedule.everyUnit = ScheduleUnit.Weeks;
        schedule.everyAmount = 3;
        schedule.startingAt = '17:50';
        //Invalid Weekdays must be ignared.
        schedule.weeklyOptions = [12 as unknown as WeekDay, WeekDay.Sunday]; 
    
        expect(ScheduleCalculator.getDescription(schedule))
            .toBe(`Not before ${getLocalizedStartingAt(schedule.startingAt)} every 3 Weeks on Sunday.`);
    });

    test('Valid Monthly recurrent schedule on specific day of the month', () => {
        const schedule = new WorkflowSchedule();
        schedule.enabled = true;
        schedule.isRecurrent = true;
        schedule.everyUnit = ScheduleUnit.Months;
        schedule.everyAmount = 1;
        schedule.startingAt = '08:30';
        schedule.monthlyOption = {
            ordinal: MonthlyOptionOrdinal.First,
            day: MonthlyOptionDayOfTheMonth["Day of the Month"]
        };

        expect(ScheduleCalculator.getDescription(schedule))
            .toBe(`Not before ${getLocalizedStartingAt(schedule.startingAt)} every 1 Months the First day of the month.`);
    });

    test('Monthly recurrent schedule on specific weekday of the month', () => {
        const schedule = new WorkflowSchedule();
        schedule.enabled = true;
        schedule.isRecurrent = true;
        schedule.everyUnit = ScheduleUnit.Months;
        schedule.everyAmount = 1;
        schedule.startingAt = '08:00';
        schedule.monthlyOption = {
            ordinal: MonthlyOptionOrdinal.Second,
            day: WeekDay.Tuesday
        };
    
        expect(ScheduleCalculator.getDescription(schedule))
            .toBe(`Not before ${getLocalizedStartingAt(schedule.startingAt)} every 1 Months the Second Tuesday.`);
    });

    test('Valid single execution schedule', () => {
        const schedule = new WorkflowSchedule();
        schedule.enabled = true;
        schedule.isRecurrent = false;
        schedule.onlyOn = new Date('2023-12-25');
    
        expect(ScheduleCalculator.getDescription(schedule))
            .toBe("Only once on Sunday, December 24 2023, 9:00:00 PM (-03:00).");
    });
})

describe(`ScheduleCalculator Class - getNextRun() - Invalid or disabled Schedule.`, () => {

    test('returns a null value when the schedule is a null reference.', () => {
        let s: WorkflowSchedule = null as unknown as WorkflowSchedule;
        expect(ScheduleCalculator.getNextRun(s)).toBeNull();
    });

    test('returns a null value when the schedule is disabled.', () => {
        let s: WorkflowSchedule = new WorkflowSchedule();
        s.enabled = false;
        expect(ScheduleCalculator.getNextRun(s)).toBeNull();
    });
})

describe(`ScheduleCalculator Class - getNextRun() - Single execution Schedule.`, () => {

    test('returns a null value when the schedule "onlyOn" attribute is null.', () => {
        let s: WorkflowSchedule = new WorkflowSchedule();
        s.enabled = true;
        s.onlyOn = null
        expect(ScheduleCalculator.getNextRun(s)).toBeNull();
    });

    test('returns a null value when the schedule "onlyOn" attribute is not a valid date.', () => {
        let s: WorkflowSchedule = new WorkflowSchedule();
        s.enabled = true;
        s.onlyOn = "invalid-date" as unknown as Date
        expect(ScheduleCalculator.getNextRun(s)).toBeNull();
    });

    test('returns a null value when the schedule was already executed.', () => {
        let s: WorkflowSchedule = new WorkflowSchedule();
        s.enabled = true;
        s.onlyOn = new Date((new Date()).getTime() - (3*60*60*1000)) //3 hours in the past.
        s.lastExecution = new Date();
        expect(ScheduleCalculator.getNextRun(s)).toBeNull();
    });

    test('returns the date set in onlyOn when the schedule was already executed in the past.', () => {
        let s: WorkflowSchedule = new WorkflowSchedule();
        s.enabled = true;
        s.onlyOn = new Date((new Date()).getTime() + (3*60*60*1000)) //3 hours in the future.
        s.lastExecution = new Date();
        expect(ScheduleCalculator.getNextRun(s)?.getTime()).toEqual(s.onlyOn.getTime())
    });

    test('returns the value set in the "onlyOn" property if the schedule was not executed yet.', () => {
        let s: WorkflowSchedule = new WorkflowSchedule();
        s.enabled = true;
        s.onlyOn = new Date();
        expect(ScheduleCalculator.getNextRun(s)).toBe(s.onlyOn);
    });
})

describe(`ScheduleCalculator Class - getNextRun() - Recurrent execution invalid cases.`, () => {

    test('returns a null value when the schedule "everyAmount" attribute type is not "number".', () => {
        let s: WorkflowSchedule = new WorkflowSchedule();
        s.enabled = true;
        s.everyAmount = "not a number" as unknown as number
        expect(ScheduleCalculator.getNextRun(s)).toBeNull();
    });

    test('returns a null value when the schedule "everyAmount" attribute type is not a numeric value".', () => {
        let s: WorkflowSchedule = new WorkflowSchedule();
        s.enabled = true;
        s.everyAmount = NaN
        expect(ScheduleCalculator.getNextRun(s)).toBeNull();
    });

    test('returns a null value when the schedule "everyAmount" attribute is below the minimum allowed value".', () => {
        let s: WorkflowSchedule = new WorkflowSchedule();
        s.enabled = true;
        s.everyAmount = EVERY_AMOUNT_MIN - 1
        expect(ScheduleCalculator.getNextRun(s)).toBeNull();
    });

    test('returns a null value when the schedule "everyAmount" attribute is higher than the maximum allowed value".', () => {
        let s: WorkflowSchedule = new WorkflowSchedule();
        s.enabled = true;
        s.everyAmount = EVERY_AMOUNT_MAX + 1
        expect(ScheduleCalculator.getNextRun(s)).toBeNull();
    });

    test('returns a null value when the schedule "startingAt" attribute type is not "string".', () => {
        let s: WorkflowSchedule = new WorkflowSchedule();
        s.enabled = true;
        s.startingAt = 1234 as unknown as string
        expect(ScheduleCalculator.getNextRun(s)).toBeNull();
    });

    test('returns a null value when the schedule "startingAt" attribute is not well formatted (startingAt="").', () => {
        let s: WorkflowSchedule = new WorkflowSchedule();
        s.enabled = true;
        s.startingAt = ""
        expect(ScheduleCalculator.getNextRun(s)).toBeNull();
    });

    test('returns a null value when the schedule "startingAt" attribute is not well formatted (startingAt="12:").', () => {
        let s: WorkflowSchedule = new WorkflowSchedule();
        s.enabled = true;
        s.startingAt = "12:"
        expect(ScheduleCalculator.getNextRun(s)).toBeNull();
    });

    test('returns a null value when the schedule "startingAt" attribute is not well formatted (startingAt=":25").', () => {
        let s: WorkflowSchedule = new WorkflowSchedule();
        s.enabled = true;
        s.startingAt = ":25"
        expect(ScheduleCalculator.getNextRun(s)).toBeNull();
    });

    test('returns a null value when the schedule "startingAt" attribute is not well formatted (startingAt="18:xx").', () => {
        let s: WorkflowSchedule = new WorkflowSchedule();
        s.enabled = true;
        s.startingAt = "18:xx"
        expect(ScheduleCalculator.getNextRun(s)).toBeNull();
    });

    test('returns a null value when the schedule "startingAt" attribute is not well formatted (startingAt="xx:56").', () => {
        let s: WorkflowSchedule = new WorkflowSchedule();
        s.enabled = true;
        s.startingAt = "xx:56"
        expect(ScheduleCalculator.getNextRun(s)).toBeNull();
    });

    test('returns a null value when the schedule "startingAt" attribute Hour part is less than zero.', () => {
        let s: WorkflowSchedule = new WorkflowSchedule();
        s.enabled = true;
        s.startingAt = "-3:16"
        expect(ScheduleCalculator.getNextRun(s)).toBeNull();
    });

    test('returns a null value when the schedule "startingAt" attribute Hour part is higher than 23.', () => {
        let s: WorkflowSchedule = new WorkflowSchedule();
        s.enabled = true;
        s.startingAt = "24:16"
        expect(ScheduleCalculator.getNextRun(s)).toBeNull();
    });

    test('returns a null value when the schedule "startingAt" attribute Minutes part is less than zero.', () => {
        let s: WorkflowSchedule = new WorkflowSchedule();
        s.enabled = true;
        s.startingAt = "13:-2"
        expect(ScheduleCalculator.getNextRun(s)).toBeNull();
    });

    test('returns a null value when the schedule "startingAt" attribute Minutes part is higher than 59.', () => {
        let s: WorkflowSchedule = new WorkflowSchedule();
        s.enabled = true;
        s.startingAt = "24:60"
        expect(ScheduleCalculator.getNextRun(s)).toBeNull();
    });

    test('returns a null value when the schedule is Weekly and weekly options is not set.', () => {
        let s: WorkflowSchedule = new WorkflowSchedule();
        s.enabled = true;
        s.everyUnit = ScheduleUnit.Weeks
        s.weeklyOptions = []
        s.startingAt = "24:60"
        expect(ScheduleCalculator.getNextRun(s)).toBeNull();
    });
})

describe(`ScheduleCalculator Class - getNextRun() - Recurrent execution in Minutes.`, () => {

    test('Schedule already executed.', () => {
        let s: WorkflowSchedule = new WorkflowSchedule();
        s.enabled = true;
        s.isRecurrent = true;
        s.everyAmount = 5;
        s.everyUnit = ScheduleUnit.Minutes;
        s.startingAt = "15:00";
        s.lastExecution = new Date();

        let nextRun = ScheduleCalculator.getNextRun(s);

        expect(nextRun).not.toBeNull();
        expect(nextRun?.getTime()).toEqual(s.lastExecution.getTime() + (s.everyAmount * 60 * 1000))
    });

    test('Schedule never executed.', () => {
        let s: WorkflowSchedule = new WorkflowSchedule();
        s.enabled = true;
        s.isRecurrent = true;
        s.everyAmount = 5;
        s.everyUnit = ScheduleUnit.Minutes;

        //Setting the start time in 1 minute from now:
        let d = new Date((new Date()).getTime() + (60 * 1000))
        s.startingAt = d.getHours().toString().padStart(2, "0") +
            ":" + d.getMinutes().toString().padStart(2, "0");
        s.lastExecution = null;

        let nextRun = ScheduleCalculator.getNextRun(s);

        expect(nextRun).not.toBeNull();
        expect(nextRun?.getFullYear()).toEqual(d.getFullYear())
        expect(nextRun?.getMonth()).toEqual(d.getMonth())
        expect(nextRun?.getDay()).toEqual(d.getDay())
        expect(nextRun?.getHours()).toEqual(d.getHours())
        expect(nextRun?.getMinutes()).toEqual(d.getMinutes())
    });
})

describe(`ScheduleCalculator Class - getNextRun() - Recurrent execution in Hours.`, () => {

    test('Schedule already executed.', () => {
        let s: WorkflowSchedule = new WorkflowSchedule();
        s.enabled = true;
        s.isRecurrent = true;
        s.everyAmount = 2;
        s.everyUnit = ScheduleUnit.Hours;
        s.startingAt = "15:00";
        s.lastExecution = new Date();

        let nextRun = ScheduleCalculator.getNextRun(s);

        expect(nextRun).not.toBeNull();
        expect(nextRun?.getTime()).toEqual(s.lastExecution.getTime() + (s.everyAmount * 60 * 60 * 1000))
    });

    test('Schedule never executed.', () => {
        let s: WorkflowSchedule = new WorkflowSchedule();
        s.enabled = true;
        s.isRecurrent = true;
        s.everyAmount = 2;
        s.everyUnit = ScheduleUnit.Hours;

        //Setting the start time in 1 minute from now:
        let d = new Date((new Date()).getTime() + (60 * 1000))
        s.startingAt = d.getHours().toString().padStart(2, "0") +
            ":" + d.getMinutes().toString().padStart(2, "0");
        s.lastExecution = null;

        let nextRun = ScheduleCalculator.getNextRun(s);

        expect(nextRun).not.toBeNull();
        expect(nextRun?.getFullYear()).toEqual(d.getFullYear())
        expect(nextRun?.getMonth()).toEqual(d.getMonth())
        expect(nextRun?.getDay()).toEqual(d.getDay())
        expect(nextRun?.getHours()).toEqual(d.getHours())
        expect(nextRun?.getMinutes()).toEqual(d.getMinutes())
    });
})

describe(`ScheduleCalculator Class - getNextRun() - Recurrent execution in Days.`, () => {

    test('Schedule already executed. Recurrent Every day', () => {
        let now = new Date()
        let s: WorkflowSchedule = new WorkflowSchedule();
        s.enabled = true;
        s.isRecurrent = true;
        s.everyAmount = 1;
        s.everyUnit = ScheduleUnit.Days;
        s.startingAt = "03:00";
        s.lastExecution = now;

        let nextRun = ScheduleCalculator.getNextRun(s);

        //Patching "now" with the time expected for the next run for comparison:
        now.setHours(Number(s.startingAt.substring(0,2)),Number(s.startingAt.substring(3)),0,0)

        expect(nextRun).not.toBeNull();
        expect(nextRun?.getTime()).toEqual(s.lastExecution.getTime() + (s.everyAmount * 24 * 60 * 60 * 1000))
    });

    test('Schedule already executed. Recurrent Every 3 days', () => {
        let now = new Date()
        let s: WorkflowSchedule = new WorkflowSchedule();
        s.enabled = true;
        s.isRecurrent = true;
        s.everyAmount = 3;
        s.everyUnit = ScheduleUnit.Days;
        s.startingAt = "03:00";
        s.lastExecution = now;

        let nextRun = ScheduleCalculator.getNextRun(s);

        //Patching "now" with the time expected for the next run for comparison:
        now.setHours(Number(s.startingAt.substring(0,2)),Number(s.startingAt.substring(3)),0,0)

        expect(nextRun).not.toBeNull();
        expect(nextRun?.getTime()).toEqual(s.lastExecution.getTime() + (s.everyAmount * 24 * 60 * 60 * 1000))
    });

    test('Schedule never executed with start time in the future today.', () => {
        let s: WorkflowSchedule = new WorkflowSchedule();
        s.enabled = true;
        s.isRecurrent = true;
        s.everyAmount = 1;
        s.everyUnit = ScheduleUnit.Days;

        //Setting the start time in 1 minute from now:
        let d = new Date((new Date()).getTime() + (60 * 1000))
        s.startingAt = d.getHours().toString().padStart(2, "0") +
            ":" + d.getMinutes().toString().padStart(2, "0");
        s.lastExecution = null;

        let nextRun = ScheduleCalculator.getNextRun(s);

        expect(nextRun).not.toBeNull();
        expect(nextRun?.getFullYear()).toEqual(d.getFullYear())
        expect(nextRun?.getMonth()).toEqual(d.getMonth())
        expect(nextRun?.getDay()).toEqual(d.getDay())
        expect(nextRun?.getHours()).toEqual(d.getHours())
        expect(nextRun?.getMinutes()).toEqual(d.getMinutes())
    });

    test('Schedule never executed with start time in the past today.', () => {
        let s: WorkflowSchedule = new WorkflowSchedule();
        s.enabled = true;
        s.isRecurrent = true;
        s.everyAmount = 1;
        s.everyUnit = ScheduleUnit.Days;

        //Setting the start time in 1 minute in the past:
        let d = new Date((new Date()).getTime() - (60 * 1000))
        s.startingAt = d.getHours().toString().padStart(2, "0") +
            ":" + d.getMinutes().toString().padStart(2, "0");
        s.lastExecution = null;

        let nextRun = ScheduleCalculator.getNextRun(s);

        let expected = SharedSystemHelper.addDays(1, d)
        expected.setSeconds(0)
        expected.setMilliseconds(0)

        expect(nextRun).not.toBeNull(); 
        expect(new Date(nextRun!)).toEqual(new Date(expected))
    });
})

describe(`ScheduleCalculator Class - getNextRun() - Recurrent execution in Weeks.`, () => {

    // afterEach(() => {
    //     // Restore the original implementation of Date if changed.
    //     jest.restoreAllMocks();
    //     Settings.now = oldLuxonSettings;
    // });

    test('Schedule already executed - With next execution on the same week.', () => {
        let now = new Date();
        let todayWeekday: WeekDay = SharedSystemHelper.getWeekDay(now);
        let s: WorkflowSchedule = new WorkflowSchedule();

        /*
        For this test we need to setup a Schedule that have a next execution on the current
        week. In order to do this and to allow running this script anytime, I tried mocking 
        both: Global Date JS object and also Luxon setting unsuccessfully.
        Sadly, this specific test will not be able to run on Mondays, because in order 
        to do that we need to set the lastExecution to Sunday an that will be a different 
        test case.
        */
        if (todayWeekday == WeekDay.Monday) {
            console.warn(`Inconclusive test: Not able to test this condition on Monday's :-)`);
            return;
        }

        s.enabled = true;
        s.isRecurrent = true;
        s.everyAmount = 1;
        s.everyUnit = ScheduleUnit.Weeks;
        s.startingAt = "21:10";
        s.lastExecution = SharedSystemHelper.addDays(-1, now)
        s.weeklyOptions = [
            SharedSystemHelper.getWeekDay(s.lastExecution),
            SharedSystemHelper.getWeekDay(now)]

        //Patching "now" with the time expected for the next run for comparison:
        now.setHours(Number(s.startingAt.substring(0,2)),Number(s.startingAt.substring(3)),0,0)

        let nextRun = ScheduleCalculator.getNextRun(s);

        expect(nextRun).not.toBeNull();
        expect(nextRun?.getTime()).toEqual(now.getTime())
    });

    test('Schedule already executed - With next execution on the next week.', () => {
        let now = new Date();
        let s: WorkflowSchedule = new WorkflowSchedule();

        s.enabled = true;
        s.isRecurrent = true;
        s.everyAmount = 1;
        s.everyUnit = ScheduleUnit.Weeks;
        s.startingAt = "21:10";
        s.lastExecution = now
        s.weeklyOptions = [
            SharedSystemHelper.getWeekDay(s.lastExecution)
        ]

        //Patching "now" with the time expected for the next run for comparison:
        now.setHours(Number(s.startingAt.substring(0,2)),Number(s.startingAt.substring(3)),0,0)

        let nextRun = ScheduleCalculator.getNextRun(s);

        expect(nextRun).not.toBeNull();
        expect(nextRun?.getTime()).toEqual(now.getTime() + (7 * 24 * 60 * 60 * 1000))
    });

    test('Schedule already executed - With next execution in 2 weeks.', () => {
        let now = new Date();
        let s: WorkflowSchedule = new WorkflowSchedule();

        s.enabled = true;
        s.isRecurrent = true;
        s.everyAmount = 2;
        s.everyUnit = ScheduleUnit.Weeks;
        s.startingAt = "21:10";
        s.lastExecution = now
        s.weeklyOptions = [
            SharedSystemHelper.getWeekDay(s.lastExecution)
        ]

        //Patching "now" with the time expected for the next run for comparison:
        now.setHours(Number(s.startingAt.substring(0,2)),Number(s.startingAt.substring(3)),0,0)

        let nextRun = ScheduleCalculator.getNextRun(s);

        expect(nextRun).not.toBeNull();
        expect(nextRun?.getTime()).toEqual(now.getTime() + (14 * 24 * 60 * 60 * 1000))
    });

    test('Schedule never executed - Have to run this week.', () => {
        let now = new Date();
        let s: WorkflowSchedule = new WorkflowSchedule();

        //Setting the start time in 2 minute from now:
        let d = new Date((new Date()).getTime() + (2 * 60 * 1000))
        s.startingAt = d.getHours().toString().padStart(2, "0") +
            ":" + d.getMinutes().toString().padStart(2, "0");

        s.enabled = true;
        s.isRecurrent = true;
        s.everyAmount = 1;
        s.everyUnit = ScheduleUnit.Weeks;
        s.lastExecution = null
        s.weeklyOptions = [
            SharedSystemHelper.getWeekDay(now)
        ]

        //Patching "now" with the time expected for the next run for comparison:
        now.setHours(Number(s.startingAt.substring(0,2)),Number(s.startingAt.substring(3)),0,0)

        let nextRun = ScheduleCalculator.getNextRun(s);

        expect(nextRun).not.toBeNull();
        expect(nextRun?.getTime()).toEqual(now.getTime())
        
    });

    test('Schedule never executed - Have to run next week.', () => {
        let now = new Date();
        let s: WorkflowSchedule = new WorkflowSchedule();
        let todayWeekday: WeekDay = SharedSystemHelper.getWeekDay(now);

        /*
        For this test we need to setup a Schedule that have a next execution on the current
        week. In order to do this and to allow running this script anytime, I tried mocking 
        both: Global Date JS object and also Luxon setting unsuccessfully.
        Sadly, this specific test will not be able to run on Mondays, because in order 
        to do that we need to set the lastExecution to Sunday an that will be a different 
        test case.
        */
        if (todayWeekday == WeekDay.Monday) {
            console.warn(`Inconclusive test: Not able to test this condition on Monday's :-)`);
            return;
        }


        s.enabled = true;
        s.isRecurrent = true;
        s.everyAmount = 1;
        s.everyUnit = ScheduleUnit.Weeks;
        s.startingAt = "21:10";
        s.lastExecution = null
        s.weeklyOptions = [
            SharedSystemHelper.getWeekDay(SharedSystemHelper.addDays(-1, now)) //Yesterdays weekday.
        ]

        //Patching "now" with the time expected for the next run for comparison:
        now.setHours(Number(s.startingAt.substring(0,2)),Number(s.startingAt.substring(3)),0,0)

        let nextRun = ScheduleCalculator.getNextRun(s);

        expect(nextRun).not.toBeNull();
        //Because the weekly Option set is yesterday weekday, we will need to run the execution in 6 days:
        expect(nextRun?.getTime()).toEqual(now.getTime() + (6 * 24 * 60 * 60 * 1000))
        
    });
})

describe(`ScheduleCalculator Class - getNextRun() - Recurrent execution in Months.`, () => {

    test('Schedule never executed - Scheduled for: nth day of the month, Every: 1 month, Next Execution: In the next month.', () => {
        let now = new Date();
        let s: WorkflowSchedule = new WorkflowSchedule();
        let startingAtHours: number = 0;
        let startingAtMinutes: number = 0;

        s.enabled = true;
        s.isRecurrent = true;
        s.everyAmount = 1;
        s.everyUnit = ScheduleUnit.Months;
        s.lastExecution = null

        //Setting the first day of the month at 00:00 is most likely the next execution gets in the past
        //, so it have to be moved to next month:
        s.monthlyOption.day = MonthlyOptionDayOfTheMonth["Day of the Month"]
        s.monthlyOption.ordinal = MonthlyOptionOrdinal.First
        s.startingAt = startingAtHours.toString().padStart(2, "0") +
            ":" + startingAtMinutes.toString().padStart(2, "0");

        let nextRun = ScheduleCalculator.getNextRun(s);

        expect(nextRun).not.toBeNull();
        expect(nextRun?.getDate()).toEqual(1)
        expect(nextRun?.getMonth()).not.toEqual(now.getMonth())
        expect(nextRun?.getHours()).toEqual(startingAtHours)
        expect(nextRun?.getMinutes()).toEqual(startingAtMinutes)
    });

    test('Schedule never executed - Scheduled for: nth day of the month, Every: 1 month, Next Execution: In the current month.', () => {
        let now = new Date();
        let s: WorkflowSchedule = new WorkflowSchedule();
        let startingAtHours: number = 23;
        let startingAtMinutes: number = 59;

        s.enabled = true;
        s.isRecurrent = true;
        s.everyAmount = 1;
        s.everyUnit = ScheduleUnit.Months;
        s.lastExecution = null

        //Setting the last day of the month at 23:59 is most likely the next execution gets in the current month:
        s.monthlyOption.day = MonthlyOptionDayOfTheMonth["Day of the Month"]
        s.monthlyOption.ordinal = MonthlyOptionOrdinal.Last
        s.startingAt = startingAtHours.toString().padStart(2, "0") +
            ":" + startingAtMinutes.toString().padStart(2, "0");

        let nextRun = ScheduleCalculator.getNextRun(s);

        //Calculating the last date:
        let lastDate: number = SharedSystemHelper.getLastDayOfMonth(now).getDate()

        expect(nextRun).not.toBeNull();
        expect(nextRun?.getDate()).toEqual(lastDate)
        expect(nextRun?.getMonth()).toEqual(now.getMonth())
        expect(nextRun?.getHours()).toEqual(startingAtHours)
        expect(nextRun?.getMinutes()).toEqual(startingAtMinutes)
    });

    test('Schedule never executed - Scheduled for: nth Weekday of the month, Every: 1 month, Next Execution: In the next month.', () => {
        let now = new Date();
        let s: WorkflowSchedule = new WorkflowSchedule();
        let startingAtHours: number = 0;
        let startingAtMinutes: number = 0;

        s.enabled = true;
        s.isRecurrent = true;
        s.everyAmount = 1;
        s.everyUnit = ScheduleUnit.Months;
        s.lastExecution = null

        let firstWeekDay: WeekDay = SharedSystemHelper.getWeekDay(
            new Date(now.getFullYear(), now.getMonth(), 1))

        //Setting the first Weekday of the month and ensuring that weekday is also the first
        //of the current month it must ensure the next execution gets in the past, so it have 
        //to be moved to next month:
        s.monthlyOption.day = firstWeekDay
        s.monthlyOption.ordinal = MonthlyOptionOrdinal.First
        s.startingAt = startingAtHours.toString().padStart(2, "0") +
            ":" + startingAtMinutes.toString().padStart(2, "0");

        let nextRun = ScheduleCalculator.getNextRun(s);

        expect(nextRun).not.toBeNull();
        expect(nextRun?.getDate()).toEqual(
            SharedSystemHelper.getNthWeekDay(SharedSystemHelper.addMonths(1, now), firstWeekDay, 1)
            .getDate())
        expect(nextRun?.getMonth()).not.toEqual(now.getMonth())
        expect(nextRun?.getHours()).toEqual(startingAtHours)
        expect(nextRun?.getMinutes()).toEqual(startingAtMinutes)
    });

    test('Schedule never executed - Scheduled for: nth Weekday of the month, Every: 1 month, Next Execution: In the current month.', () => {
        let now = new Date();
        let s: WorkflowSchedule = new WorkflowSchedule();
        let startingAtHours: number = 23;
        let startingAtMinutes: number = 59;

        s.enabled = true;
        s.isRecurrent = true;
        s.everyAmount = 1;
        s.everyUnit = ScheduleUnit.Months;
        s.lastExecution = null

        let lastDate: Date = SharedSystemHelper.getLastDayOfMonth(now)
        let lastWeekDay: WeekDay = SharedSystemHelper.getWeekDay(lastDate)

        //Setting the last day of the month at 23:59 is most likely the next execution gets in the current month:
        s.monthlyOption.day = lastWeekDay
        s.monthlyOption.ordinal = MonthlyOptionOrdinal.Last
        s.startingAt = startingAtHours.toString().padStart(2, "0") +
            ":" + startingAtMinutes.toString().padStart(2, "0");

        let nextRun = ScheduleCalculator.getNextRun(s);

        expect(nextRun).not.toBeNull();
        expect(nextRun?.getDate()).toEqual(lastDate.getDate())
        expect(nextRun?.getMonth()).toEqual(now.getMonth())
        expect(nextRun?.getHours()).toEqual(startingAtHours)
        expect(nextRun?.getMinutes()).toEqual(startingAtMinutes)
    });

    test('Schedule already executed - Scheduled for: nth day of the month, Every: 2 month, Next Execution: In a future month.', () => {
        let now = new Date();
        let s: WorkflowSchedule = new WorkflowSchedule();
        let startingAtHours: number = 0;
        let startingAtMinutes: number = 0;

        s.enabled = true;
        s.isRecurrent = true;
        s.everyAmount = 2;
        s.everyUnit = ScheduleUnit.Months;
        s.lastExecution = now;

        //Setting the first day of the month at 00:00 is most likely the next execution gets in the past
        //, so it have to be moved to next month:
        s.monthlyOption.day = MonthlyOptionDayOfTheMonth["Day of the Month"]
        s.monthlyOption.ordinal = MonthlyOptionOrdinal.First
        s.startingAt = startingAtHours.toString().padStart(2, "0") +
            ":" + startingAtMinutes.toString().padStart(2, "0");

        let nextRun = ScheduleCalculator.getNextRun(s);

        expect(nextRun).not.toBeNull();
        expect(nextRun?.getDate()).toEqual(1)
        expect(nextRun?.getMonth()).toEqual(SharedSystemHelper.addMonths(2, now).getMonth())
        expect(nextRun?.getHours()).toEqual(startingAtHours)
        expect(nextRun?.getMinutes()).toEqual(startingAtMinutes)
    });

    test('Schedule already executed - Scheduled for: nth day of the month, Every: 2 month, Next Execution: In the current month.', () => {
        let now = new Date();
        let s: WorkflowSchedule = new WorkflowSchedule();
        let startingAtHours: number = 23;
        let startingAtMinutes: number = 59;

        s.enabled = true;
        s.isRecurrent = true;
        s.everyAmount = 2;
        s.everyUnit = ScheduleUnit.Months;
        s.lastExecution = SharedSystemHelper.addMonths(-2, now);

        //Setting the last day of the month at 23:59 and why last exec was exactly 2 months ago
        //is most likely the next execution gets in the current month:
        s.monthlyOption.day = MonthlyOptionDayOfTheMonth["Day of the Month"]
        s.monthlyOption.ordinal = MonthlyOptionOrdinal.Last
        s.startingAt = startingAtHours.toString().padStart(2, "0") +
            ":" + startingAtMinutes.toString().padStart(2, "0");

        let nextRun = ScheduleCalculator.getNextRun(s);

        let lastDay = SharedSystemHelper.getLastDayOfMonth(now).getDate();

        expect(nextRun).not.toBeNull();
        expect(nextRun?.getDate()).toEqual(lastDay)
        expect(nextRun?.getMonth()).toEqual(now.getMonth())
        expect(nextRun?.getHours()).toEqual(startingAtHours)
        expect(nextRun?.getMinutes()).toEqual(startingAtMinutes)
    });

    test('Schedule already executed - Scheduled for: nth Weekday of the month, Every: 2 month, Next Execution: In a future month.', () => {
        let now = new Date();
        let s: WorkflowSchedule = new WorkflowSchedule();
        let startingAtHours: number = 0;
        let startingAtMinutes: number = 0;

        s.enabled = true;
        s.isRecurrent = true;
        s.everyAmount = 2;
        s.everyUnit = ScheduleUnit.Months;
        s.lastExecution = now;

        s.monthlyOption.day = WeekDay.Monday
        s.monthlyOption.ordinal = MonthlyOptionOrdinal.Second
        s.startingAt = startingAtHours.toString().padStart(2, "0") +
            ":" + startingAtMinutes.toString().padStart(2, "0");

        let nextRun = ScheduleCalculator.getNextRun(s);

        let secondMonday = SharedSystemHelper.getNthWeekDay(SharedSystemHelper.addMonths(s.everyAmount, now), WeekDay.Monday, 2)

        expect(nextRun).not.toBeNull();
        expect(nextRun?.getDate()).toEqual(secondMonday.getDate())
        expect(SharedSystemHelper.getWeekDay(nextRun!)).toEqual(WeekDay.Monday)
        expect(nextRun?.getMonth()).toEqual(SharedSystemHelper.addMonths(2, now).getMonth())
        expect(nextRun?.getHours()).toEqual(startingAtHours)
        expect(nextRun?.getMinutes()).toEqual(startingAtMinutes)
    });

    test('Schedule already executed - Scheduled for: nth Weekday of the month, Every: 2 month, Next Execution: In the current month.', () => {
        let now = new Date();
        let s: WorkflowSchedule = new WorkflowSchedule();
        let startingAtHours: number = 23;
        let startingAtMinutes: number = 59;

        s.enabled = true;
        s.isRecurrent = true;
        s.everyAmount = 2;
        s.everyUnit = ScheduleUnit.Months;
        s.lastExecution = SharedSystemHelper.addMonths(-2, now);

        let lastDate = SharedSystemHelper.getLastDayOfMonth(now)
        let lastWeekday = SharedSystemHelper.getWeekDay(lastDate)

        s.monthlyOption.day = lastWeekday
        s.monthlyOption.ordinal = MonthlyOptionOrdinal.Last
        s.startingAt = startingAtHours.toString().padStart(2, "0") +
            ":" + startingAtMinutes.toString().padStart(2, "0");

        let nextRun = ScheduleCalculator.getNextRun(s);

        expect(nextRun).not.toBeNull();
        expect(nextRun?.getDate()).toEqual(lastDate.getDate())
        expect(SharedSystemHelper.getWeekDay(nextRun!)).toEqual(lastWeekday)
        expect(nextRun?.getMonth()).toEqual(now.getMonth())
        expect(nextRun?.getHours()).toEqual(startingAtHours)
        expect(nextRun?.getMinutes()).toEqual(startingAtMinutes)
    });
})