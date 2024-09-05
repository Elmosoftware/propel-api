import { SharedSystemHelper, WeekDay } from "../../utils/shared-system-helper";

describe("SharedSystemHelper Class - isValidDate()", () => {

    test('returns false for a null value', () => {
        //@ts-ignore
        expect(SharedSystemHelper.isValidDate(null)).toBe(false);
    });

    test('returns false for an invalid date string', () => {
        const invalidDateString = '2024-13-01';
        expect(SharedSystemHelper.isValidDate(invalidDateString)).toBe(false);
    });

    test('returns false for an invalid date object', () => {
        const invalidDate = new Date('invalid-date');
        expect(SharedSystemHelper.isValidDate(invalidDate)).toBe(false);
    });

    test('returns false for an empty string', () => {
        const emptyString = '';
        expect(SharedSystemHelper.isValidDate(emptyString)).toBe(false);
    });

    test('returns false for a non-date string', () => {
        const nonDateString = 'not-a-date';
        expect(SharedSystemHelper.isValidDate(nonDateString)).toBe(false);
    });

    test('returns true for a valid Date object', () => {
        const date = new Date('2024-01-01');
        expect(SharedSystemHelper.isValidDate(date)).toBe(true);
    });

    test('returns true for a valid date string', () => {
        const dateString = '2024-01-01';
        expect(SharedSystemHelper.isValidDate(dateString)).toBe(true);
    });

    test('returns true for a valid ISO date string full', () => {
        const dateString = '2024-08-06T17:49:00.287+0000';
        expect(SharedSystemHelper.isValidDate(dateString)).toBe(true);
    });

    test('returns true for a valid ISO date string partial', () => {
        const dateString = '1983-10-14T10:30';
        expect(SharedSystemHelper.isValidDate(dateString)).toBe(true);
    });

    test('returns true for a Date object representing an invalid date (NaN)', () => {
        const date = new Date(NaN);
        expect(SharedSystemHelper.isValidDate(date)).toBe(false);
    });

    test('returns true for a Date object representing epoch time (0)', () => {
        const date = new Date(0);
        expect(SharedSystemHelper.isValidDate(date)).toBe(true);
    });
})

describe("SharedSystemHelper Class - getDifference()", () => {

    test('returns the correct difference when both dates are valid and start is before end', () => {
        const start = new Date('2024-01-01T00:00:00.000Z');
        const end = new Date('2024-01-01T01:00:00.000Z');
        expect(SharedSystemHelper.getDifference(start, end)).toBe(3600000); // 1 hour in milliseconds
    });

    test('returns the correct difference when both dates are valid and start is after end', () => {
        const start = new Date('2024-01-01T01:00:00.000Z');
        const end = new Date('2024-01-01T00:00:00.000Z');
        expect(SharedSystemHelper.getDifference(start, end)).toBe(-3600000); // -1 hour in milliseconds
    });

    test('returns 0 when both dates are the same', () => {
        const date = new Date('2024-01-01T00:00:00.000Z');
        expect(SharedSystemHelper.getDifference(date, date)).toBe(0);
    });

    test('returns null when the start date is invalid', () => {
        const invalidStart = 'invalid-date';
        const end = new Date('2024-01-01T00:00:00.000Z');
        expect(SharedSystemHelper.getDifference(invalidStart, end)).toBeNull();
    });

    test('returns null when the end date is invalid', () => {
        const start = new Date('2024-01-01T00:00:00.000Z');
        const invalidEnd = 'invalid-date';
        expect(SharedSystemHelper.getDifference(start, invalidEnd)).toBeNull();
    });

    test('returns null when both dates are invalid', () => {
        const invalidStart = 'invalid-date';
        const invalidEnd = 'invalid-date';
        expect(SharedSystemHelper.getDifference(invalidStart, invalidEnd)).toBeNull();
    });

    test('handles date strings correctly', () => {
        const start = '2024-01-01T00:00:00.000Z';
        const end = '2024-01-01T01:00:00.000Z';
        expect(SharedSystemHelper.getDifference(start, end)).toBe(3600000); // 1 hour in milliseconds
    });

    test('handles mixed date formats correctly', () => {
        const start = '2024-01-01T00:00:00.000Z';
        const end = new Date('2024-01-01T01:00:00.000Z');
        expect(SharedSystemHelper.getDifference(start, end)).toBe(3600000); // 1 hour in milliseconds
    });

})

describe("SharedSystemHelper Class - isEqual()", () => {

    test('returns true when both dates are equal', () => {
        const date1 = new Date('2024-01-01T00:00:00.000Z');
        const date2 = new Date('2024-01-01T00:00:00.000Z');
        expect(SharedSystemHelper.isEqual(date1, date2)).toBe(true);
    });

    test('returns false for different date strings', () => {
        const date1 = '2024-01-01T00:00:00.000Z';
        const date2 = '2024-01-02T00:00:00.000Z';
        expect(SharedSystemHelper.isEqual(date1, date2)).toBe(false);
    });

    test('returns null when the first date string is invalid', () => {
        const invalidDate1 = 'invalid-date';
        const date2 = '2024-01-01T00:00:00.000Z';
        expect(SharedSystemHelper.isEqual(invalidDate1, date2)).toBeNull();
    });

    test('returns null when the second date string is invalid', () => {
        const date1 = '2024-01-01T00:00:00.000Z';
        const invalidDate2 = 'invalid-date';
        expect(SharedSystemHelper.isEqual(date1, invalidDate2)).toBeNull();
    });

    test('returns null when both date strings are invalid', () => {
        const invalidDate1 = 'invalid-date';
        const invalidDate2 = 'invalid-date';
        expect(SharedSystemHelper.isEqual(invalidDate1, invalidDate2)).toBeNull();
    });

    test('returns false when dates are different', () => {
        const date1 = new Date('2024-01-01T00:00:00.000Z');
        const date2 = new Date('2024-01-01T01:00:00.000Z');
        expect(SharedSystemHelper.isEqual(date1, date2)).toBe(false);
    });

    test('returns false when dates are millisecond different', () => {
        const date1 = new Date('2024-01-01T01:00:00.001Z');
        const date2 = new Date('2024-01-01T01:00:00.000Z');
        expect(SharedSystemHelper.isEqual(date1, date2)).toBe(false);
    });

    test('returns null when the first date is invalid', () => {
        const invalidDate1 = 'invalid-date';
        const date2 = new Date('2024-01-01T00:00:00.000Z');
        expect(SharedSystemHelper.isEqual(invalidDate1, date2)).toBeNull();
    });

    test('returns null when the second date is invalid', () => {
        const date1 = new Date('2024-01-01T00:00:00.000Z');
        const invalidDate2 = 'invalid-date';
        expect(SharedSystemHelper.isEqual(date1, invalidDate2)).toBeNull();
    });

    test('returns null when both dates are invalid', () => {
        const invalidDate1 = 'invalid-date';
        const invalidDate2 = 'invalid-date';
        expect(SharedSystemHelper.isEqual(invalidDate1, invalidDate2)).toBeNull();
    });

    test('handles date strings correctly', () => {
        const date1 = '2024-01-01T00:00:00.000Z';
        const date2 = '2024-01-01T00:00:00.000Z';
        expect(SharedSystemHelper.isEqual(date1, date2)).toBe(true);
    });

    test('handles mixed date formats correctly', () => {
        const date1 = '2024-01-01T00:00:00.000Z';
        const date2 = new Date('2024-01-01T00:00:00.000Z');
        expect(SharedSystemHelper.isEqual(date1, date2)).toBe(true);
    });

    test('returns true for equal date strings', () => {
        const date1 = '2024-01-01T00:00:00.000Z';
        const date2 = '2024-01-01T00:00:00.000Z';
        expect(SharedSystemHelper.isEqual(date1, date2)).toBe(true);
    });
})

describe("SharedSystemHelper Class - isBefore()", () => {
    test('returns true when date is before relativeTo', () => {
        const date = new Date('2024-01-01T00:00:00.000Z');
        const relativeTo = new Date('2024-01-02T00:00:00.000Z');
        expect(SharedSystemHelper.isBefore(date, relativeTo)).toBe(true);
    });

    test('returns true when date is millisecond before relativeTo', () => {
        const date = new Date('2024-01-01T01:12:56.492Z');
        const relativeTo = new Date('2024-01-01T01:12:56.493Z');
        expect(SharedSystemHelper.isBefore(date, relativeTo)).toBe(true);
    });

    test('returns false when date is after relativeTo', () => {
        const date = new Date('2024-01-02T00:00:00.000Z');
        const relativeTo = new Date('2024-01-01T00:00:00.000Z');
        expect(SharedSystemHelper.isBefore(date, relativeTo)).toBe(false);
    });

    test('returns false when date is equal to relativeTo', () => {
        const date = new Date('2024-01-01T00:00:00.000Z');
        const relativeTo = new Date('2024-01-01T00:00:00.000Z');
        expect(SharedSystemHelper.isBefore(date, relativeTo)).toBe(false);
    });

    test('returns null when the date is invalid', () => {
        const invalidDate = 'invalid-date';
        const relativeTo = new Date('2024-01-01T00:00:00.000Z');
        expect(SharedSystemHelper.isBefore(invalidDate, relativeTo)).toBeNull();
    });

    test('returns null when relativeTo is invalid', () => {
        const date = new Date('2024-01-01T00:00:00.000Z');
        const invalidRelativeTo = 'invalid-date';
        expect(SharedSystemHelper.isBefore(date, invalidRelativeTo)).toBeNull();
    });

    test('returns null when both dates are invalid', () => {
        const invalidDate = 'invalid-date';
        const invalidRelativeTo = 'invalid-date';
        expect(SharedSystemHelper.isBefore(invalidDate, invalidRelativeTo)).toBeNull();
    });

    test('handles date strings correctly', () => {
        const date = '2024-01-01T00:00:00.000Z';
        const relativeTo = '2024-01-02T00:00:00.000Z';
        expect(SharedSystemHelper.isBefore(date, relativeTo)).toBe(true);
    });

    test('handles mixed date formats correctly', () => {
        const date = '2024-01-01T00:00:00.000Z';
        const relativeTo = new Date('2024-01-02T00:00:00.000Z');
        expect(SharedSystemHelper.isBefore(date, relativeTo)).toBe(true);
    });

    // Additional tests for string date types
    test('returns true for date strings where date is before relativeTo', () => {
        const date = '2024-01-01T00:00:00.000Z';
        const relativeTo = '2024-01-02T00:00:00.000Z';
        expect(SharedSystemHelper.isBefore(date, relativeTo)).toBe(true);
    });

    test('returns false for date strings where date is after relativeTo', () => {
        const date = '2024-01-02T00:00:00.000Z';
        const relativeTo = '2024-01-01T00:00:00.000Z';
        expect(SharedSystemHelper.isBefore(date, relativeTo)).toBe(false);
    });

    test('returns null when the first date string is invalid', () => {
        const invalidDate = 'invalid-date';
        const relativeTo = '2024-01-01T00:00:00.000Z';
        expect(SharedSystemHelper.isBefore(invalidDate, relativeTo)).toBeNull();
    });

    test('returns null when the second date string is invalid', () => {
        const date = '2024-01-01T00:00:00.000Z';
        const invalidRelativeTo = 'invalid-date';
        expect(SharedSystemHelper.isBefore(date, invalidRelativeTo)).toBeNull();
    });

    test('returns null when both date strings are invalid', () => {
        const invalidDate = 'invalid-date';
        const invalidRelativeTo = 'invalid-date';
        expect(SharedSystemHelper.isBefore(invalidDate, invalidRelativeTo)).toBeNull();
    });
})

describe("SharedSystemHelper Class - isAfter()", () => {

    test('returns true when date is after relativeTo', () => {
        const date = new Date('2024-01-02T00:00:00.000Z');
        const relativeTo = new Date('2024-01-01T00:00:00.000Z');
        expect(SharedSystemHelper.isAfter(date, relativeTo)).toBe(true);
    });

    test('returns false when date is before relativeTo', () => {
        const date = new Date('2024-01-01T00:00:00.000Z');
        const relativeTo = new Date('2024-01-02T00:00:00.000Z');
        expect(SharedSystemHelper.isAfter(date, relativeTo)).toBe(false);
    });

    test('returns false when date is equal to relativeTo', () => {
        const date = new Date('2024-01-01T00:00:00.000Z');
        const relativeTo = new Date('2024-01-01T00:00:00.000Z');
        expect(SharedSystemHelper.isAfter(date, relativeTo)).toBe(false);
    });

    test('returns null when the date is invalid', () => {
        const invalidDate = 'invalid-date';
        const relativeTo = new Date('2024-01-01T00:00:00.000Z');
        expect(SharedSystemHelper.isAfter(invalidDate, relativeTo)).toBeNull();
    });

    test('returns null when relativeTo is invalid', () => {
        const date = new Date('2024-01-01T00:00:00.000Z');
        const invalidRelativeTo = 'invalid-date';
        expect(SharedSystemHelper.isAfter(date, invalidRelativeTo)).toBeNull();
    });

    test('returns null when both dates are invalid', () => {
        const invalidDate = 'invalid-date';
        const invalidRelativeTo = 'invalid-date';
        expect(SharedSystemHelper.isAfter(invalidDate, invalidRelativeTo)).toBeNull();
    });

    test('handles date strings correctly', () => {
        const date = '2024-01-02T00:00:00.000Z';
        const relativeTo = '2024-01-01T00:00:00.000Z';
        expect(SharedSystemHelper.isAfter(date, relativeTo)).toBe(true);
    });

    test('handles mixed date formats correctly', () => {
        const date = '2024-01-02T00:00:00.000Z';
        const relativeTo = new Date('2024-01-01T00:00:00.000Z');
        expect(SharedSystemHelper.isAfter(date, relativeTo)).toBe(true);
    });

    // Additional tests for string date types
    test('returns true for date strings where date is after relativeTo', () => {
        const date = '2024-01-02T00:00:00.000Z';
        const relativeTo = '2024-01-01T00:00:00.000Z';
        expect(SharedSystemHelper.isAfter(date, relativeTo)).toBe(true);
    });

    test('returns false for date strings where date is before relativeTo', () => {
        const date = '2024-01-01T00:00:00.000Z';
        const relativeTo = '2024-01-02T00:00:00.000Z';
        expect(SharedSystemHelper.isAfter(date, relativeTo)).toBe(false);
    });

    test('returns null when the first date string is invalid', () => {
        const invalidDate = 'invalid-date';
        const relativeTo = '2024-01-01T00:00:00.000Z';
        expect(SharedSystemHelper.isAfter(invalidDate, relativeTo)).toBeNull();
    });

    test('returns null when the second date string is invalid', () => {
        const date = '2024-01-02T00:00:00.000Z';
        const invalidRelativeTo = 'invalid-date';
        expect(SharedSystemHelper.isAfter(date, invalidRelativeTo)).toBeNull();
    });

    test('returns null when both date strings are invalid', () => {
        const invalidDate = 'invalid-date';
        const invalidRelativeTo = 'invalid-date';
        expect(SharedSystemHelper.isAfter(invalidDate, invalidRelativeTo)).toBeNull();
    });
})

describe("SharedSystemHelper Class - addMinutes()", () => {

    test('adds positive minutes to a specified date', () => {
        const date = new Date('2024-01-01T00:00:00.000Z');
        const result = SharedSystemHelper.addMinutes(30, date);
        expect(result).toEqual(new Date('2024-01-01T00:30:00.000Z'));
    });

    test('subtracts minutes when a negative value is provided', () => {
        const date = new Date('2024-01-01T00:00:00.000Z');
        const result = SharedSystemHelper.addMinutes(-15, date);
        expect(result).toEqual(new Date('2023-12-31T23:45:00.000Z'));
    });

    test('add minutes to the current date when no date is provided', () => {
        const before = new Date();
        const result = SharedSystemHelper.addMinutes(10);
        const after = new Date();
        expect(result.getTime()).toBeGreaterThanOrEqual(before.getTime() + 10 * 60 * 1000);
        expect(result.getTime()).toBeLessThanOrEqual(after.getTime() + 10 * 60 * 1000);
    });

    test('subtract minutes to the current date when no date is provided', () => {
        const before = new Date();
        const result = SharedSystemHelper.addMinutes(-10);
        const after = new Date();
        expect(result.getTime()).toBeGreaterThanOrEqual(before.getTime() - 10 * 60 * 1000);
        expect(result.getTime()).toBeLessThanOrEqual(after.getTime() - 10 * 60 * 1000);
    });

    test('returns a valid date when adding minutes to a valid date string', () => {
        const date = '2024-01-01T00:00:00.000Z';
        const result = SharedSystemHelper.addMinutes(45, date);
        expect(result).toEqual(new Date('2024-01-01T00:45:00.000Z'));
    });

    test('returns a valid date when subtracting minutes from a valid date string', () => {
        const date = '2024-01-01T00:00:00.000Z';
        const result = SharedSystemHelper.addMinutes(-30, date);
        expect(result).toEqual(new Date('2023-12-31T23:30:00.000Z'));
    });

    test('throws an error when an invalid minutes value is provided', () => {
        const invalidMinutes = 'invalid-minutes' as unknown as number;
        expect(() => {
            SharedSystemHelper.addMinutes(invalidMinutes);
        }).toThrow(`We expect a "number" type`);
    });

    test('throws an error when an invalid date string is provided', () => {
        const invalidDate = 'invalid-date';
        expect(() => {
            SharedSystemHelper.addMinutes(30, invalidDate);
        }).toThrow(`We expect a valid date value`);
    });

    test('throws an error when a non-date object is provided', () => {
        const invalidDate = 12345 as unknown as string;
        expect(() => {
            SharedSystemHelper.addMinutes(30, invalidDate);
        }).toThrow(`We expect a valid date value`);
    });
})

describe("SharedSystemHelper Class - addDays()", () => {

    test('adds positive days to a specified date object', () => {
        const date = new Date('2024-01-01T00:00:00.000Z');
        const result = SharedSystemHelper.addDays(10, date);
        expect(result).toEqual(new Date('2024-01-11T00:00:00.000Z'));
    });

    test('subtracts days when a negative value is provided to a specified date object', () => {
        const date = new Date('2024-01-10T00:00:00.000Z');
        const result = SharedSystemHelper.addDays(-5, date);
        expect(result).toEqual(new Date('2024-01-05T00:00:00.000Z'));
    });

    test('uses the current date when no date is provided', () => {
        const before = new Date();
        const result = SharedSystemHelper.addDays(10);
        const after = new Date();
        expect(result.getTime()).toBeGreaterThanOrEqual(before.getTime() + 10 * 24 * 60 * 60 * 1000);
        expect(result.getTime()).toBeLessThanOrEqual(after.getTime() + 10 * 24 * 60 * 60 * 1000);
    });

    test('adds days to a valid date string', () => {
        const date = '2024-01-01T00:00:00.000Z';
        const result = SharedSystemHelper.addDays(5, date);
        expect(result).toEqual(new Date('2024-01-06T00:00:00.000Z'));
    });

    test('subtracts days from a valid date string', () => {
        const date = '2024-01-10T00:00:00.000Z';
        const result = SharedSystemHelper.addDays(-3, date);
        expect(result).toEqual(new Date('2024-01-07T00:00:00.000Z'));
    });

    test('throws an error when the days parameter is not a number', () => {
        const date = new Date('2024-01-01T00:00:00.000Z');
        const invalidDays = 'five' as unknown as number;
        expect(() => {
            SharedSystemHelper.addDays(invalidDays, date);
        }).toThrow('We expect a "number" type for the parameter "days"');
    });

    test('throws an error when an invalid date string is provided', () => {
        const invalidDate = 'invalid-date';
        expect(() => {
            SharedSystemHelper.addDays(5, invalidDate);
        }).toThrow('We expect a valid date value for parameter "date"');
    });

    test('throws an error when a non-date object is provided', () => {
        const invalidDate = 12345 as unknown as Date;
        expect(() => {
            SharedSystemHelper.addDays(5, invalidDate);
        }).toThrow(`We expect a valid date value for parameter "date"`);
    });
})

describe("SharedSystemHelper Class - addMonths()", () => {
    test('should add months to a valid Date object (Leap year)', () => {
        const date = new Date('2024-01-31T10:00:00.000Z');
        const result = SharedSystemHelper.addMonths(1, date);
        expect(result.toISOString()).toBe('2024-02-29T10:00:00.000Z'); // Leap year check
    });

    test('should subtract months from a valid Date object (Leap year)', () => {
        const date = new Date('2024-03-31T10:00:00.000Z');
        const result = SharedSystemHelper.addMonths(-1, date);
        expect(result.toISOString()).toBe('2024-02-29T10:00:00.000Z'); // Leap year check
    });

    test('should return the correct date when adding months to a string date (Leap year)', () => {
        const date = '2024-01-31T10:00:00.000Z';
        const result = SharedSystemHelper.addMonths(1, date);
        expect(result.toISOString()).toBe('2024-02-29T10:00:00.000Z'); // Leap year check
    });

    test('should handle negative months correctly when date is a string (Leap year)', () => {
        const date = '2024-03-31T10:00:00.000Z';
        const result = SharedSystemHelper.addMonths(-1, date);
        expect(result.toISOString()).toBe('2024-02-29T10:00:00.000Z'); // Leap year check
    });

    test('should add months to a valid Date object (Non Leap year)', () => {
        const date = new Date('2023-01-31T10:00:00.000Z');
        const result = SharedSystemHelper.addMonths(1, date);
        expect(result.toISOString()).toBe('2023-02-28T10:00:00.000Z');
    });

    test('should subtract months from a valid Date object (Non Leap year)', () => {
        const date = new Date('2023-03-31T10:00:00.000Z');
        const result = SharedSystemHelper.addMonths(-1, date);
        expect(result.toISOString()).toBe('2023-02-28T10:00:00.000Z');
    });

    test('should return the correct date when adding months to a string date (Non Leap year)', () => {
        const date = '2023-01-31T10:00:00.000Z';
        const result = SharedSystemHelper.addMonths(1, date);
        expect(result.toISOString()).toBe('2023-02-28T10:00:00.000Z');
    });

    test('should handle negative months correctly when date is a string (Non Leap year)', () => {
        const date = '2023-03-31T10:00:00.000Z';
        const result = SharedSystemHelper.addMonths(-1, date);
        expect(result.toISOString()).toBe('2023-02-28T10:00:00.000Z');
    });

    test('should return the correct date when adding months to a string date (First day of the month)', () => {
        const date = '2023-11-01T10:00:00.000Z';
        const result = SharedSystemHelper.addMonths(1, date);
        expect(result.toISOString()).toBe('2023-12-01T10:00:00.000Z');
    });

    test('should handle negative months correctly when date is a string (Mid day of the month)', () => {
        const date = '2023-05-15T10:00:00.000Z';
        const result = SharedSystemHelper.addMonths(-1, date);
        expect(result.toISOString()).toBe('2023-04-15T10:00:00.000Z');
    });

    test('should use the current date when no date is provided', () => {
        const currentDate = new Date();
        const expectedDate = new Date(currentDate);
        expectedDate.setMonth(currentDate.getMonth() + 1);

        const result = SharedSystemHelper.addMonths(1);
        expect(result.getMonth()).toBe(expectedDate.getMonth());
        expect(result.getFullYear()).toBe(expectedDate.getFullYear());
    });

    test('should throw an error if months is not a number', () => {
        const date = new Date('2024-03-31T10:00:00.000Z');
        expect(() => SharedSystemHelper.addMonths('two' as any, date))
            .toThrowError(`We expect a "number" type for the parameter "months"`);
    });

    test('should throw an error if the date is invalid', () => {
        expect(() => SharedSystemHelper.addMonths(1, 'invalid-date'))
            .toThrowError(`We expect a valid date value for parameter "date"`);
    });
});

describe("SharedSystemHelper Class - getWeekDay()", () => {

    test('returns the correct weekday for a valid date object', () => {
        const date = new Date('2024-08-07T10:00:00.000Z'); // Wednesday
        expect(SharedSystemHelper.getWeekDay(date)).toBe(WeekDay.Wednesday);
    });

    test('returns the correct weekday for a valid date string', () => {
        const date = '2024-08-07T10:00:00.000Z'; // Wednesday
        expect(SharedSystemHelper.getWeekDay(date)).toBe(WeekDay.Wednesday);
    });

    test('returns the correct weekday for a different valid date string', () => {
        const date = '2024-08-08T10:00:00.000Z'; // Thursday
        expect(SharedSystemHelper.getWeekDay(date)).toBe(WeekDay.Thursday);
    });

    test('throws an error for an invalid date string', () => {
        const invalidDate = 'invalid-date';
        expect(() => {
            SharedSystemHelper.getWeekDay(invalidDate);
        }).toThrow('We expect a valid date value');
    });

    test('throws an error for a non-date object', () => {
        const invalidDate = 12345 as unknown as Date;
        expect(() => {
            SharedSystemHelper.getWeekDay(invalidDate);
        }).toThrow(`We expect a valid date value`);
    });

    test('returns the correct weekday for the current date', () => {
        const date = new Date();
        const weekday = date.getDay() === 0 ? 7 : date.getDay(); // JavaScript's getDay returns 0 for Sunday
        expect(SharedSystemHelper.getWeekDay(date)).toBe(weekday);
    });
})

describe("SharedSystemHelper Class - getFirstDayOfWeek()", () => {

    test('returns the correct Monday for a given date object', () => {
        const date = new Date('2024-08-07T14:30:00.000Z'); // Wednesday
        const result = SharedSystemHelper.getFirstDayOfWeek(date);
        expect(result).toEqual(new Date('2024-08-05T14:30:00.000Z')); // Monday
    });

    test('returns the correct Monday for a given date string', () => {
        const date = '2024-08-07T14:30:00.000Z'; // Wednesday
        const result = SharedSystemHelper.getFirstDayOfWeek(date);
        expect(result).toEqual(new Date('2024-08-05T14:30:00.000Z')); // Monday
    });

    test('returns the correct Monday for a date that is already a Monday', () => {
        const date = new Date('2024-08-05T14:30:00.000Z'); // Monday
        const result = SharedSystemHelper.getFirstDayOfWeek(date);
        expect(result).toEqual(new Date('2024-08-05T14:30:00.000Z')); // Same Monday
    });

    test('throws an error for an invalid date string', () => {
        const invalidDate = 'invalid-date';
        expect(() => {
            SharedSystemHelper.getFirstDayOfWeek(invalidDate);
        }).toThrow(`We expect a valid date value for parameter "date"`);
    });

    test('throws an error for a non-date object', () => {
        const invalidDate = 12345 as unknown as Date;
        expect(() => {
            SharedSystemHelper.getFirstDayOfWeek(invalidDate);
        }).toThrow(`We expect a valid date value for parameter "date"`);
    });

    test('handles different valid date string formats', () => {
        const date = '2024-08-07'; // Wednesday in a different format
        const result = SharedSystemHelper.getFirstDayOfWeek(date);
        // Monday 00:00 GMT-3 is Monday 03:00 UTC:
        expect(result).toEqual(new Date('2024-08-05T03:00:00.000Z'));
    });
})

describe("SharedSystemHelper Class - getLastDayOfMonth()", () => {

    test('should return the last day of the month for a given date object', () => {
        const date = new Date('2024-08-07T14:30:00.000Z');
        const result = SharedSystemHelper.getLastDayOfMonth(date);
        expect(result.toISOString()).toBe('2024-08-31T14:30:00.000Z');
    });

    test('should return the last day of the month for a date at the end of the month', () => {
        const date = new Date('2024-08-31T14:30:00.000Z');
        const result = SharedSystemHelper.getLastDayOfMonth(date);
        expect(result.toISOString()).toBe('2024-08-31T14:30:00.000Z');
    });

    test('should return the last day of the month for a leap year February', () => {
        const date = new Date('2024-02-15T10:00:00.000Z');
        const result = SharedSystemHelper.getLastDayOfMonth(date);
        expect(result.toISOString()).toBe('2024-02-29T10:00:00.000Z'); // Leap year February has 29 days
    });

    test('should return the last day of the month for a non-leap year February', () => {
        const date = new Date('2023-02-15T10:00:00.000Z');
        const result = SharedSystemHelper.getLastDayOfMonth(date);
        expect(result.toISOString()).toBe('2023-02-28T10:00:00.000Z'); // Non-leap year February has 28 days
    });

    test('should return the last day of the month when the input is a date string', () => {
        const date = '2024-07-15T08:45:00.000Z';
        const result = SharedSystemHelper.getLastDayOfMonth(date);
        expect(result.toISOString()).toBe('2024-07-31T08:45:00.000Z');
    });

    test('should throw an error if the date is invalid', () => {
        expect(() => SharedSystemHelper.getLastDayOfMonth('invalid-date'))
            .toThrowError(`We expect a valid date value for parameter "date"`);
    });

    test('should preserve the original time when returning the last day of the month', () => {
        const date = new Date('2024-10-15T22:45:30.123Z');
        const result = SharedSystemHelper.getLastDayOfMonth(date);
        expect(result.toISOString()).toBe('2024-10-31T22:45:30.123Z');
    });
})

describe("SharedSystemHelper Class - getNthWeekDay()", () => {

    // test('Month with 28 days with first weekday Monday - getting ordinal 1', () => {
    //     const sent = new Date('2021-02-02T22:54:38.000'); //Using local time here to avoid 
    //     //conversions to UTC that could lead to a change of the intended month.
    //     const expected = new Date('2021-02-01T22:54:38.000')
    //     const actual = SharedSystemHelper.getNthWeekDay(sent, WeekDay.Monday, 1);

    //     expect(expected.getTime()).toEqual(actual.getTime());
    // });

    // test('should return the correct date for the 1st Monday of August 2024', () => {
    //     const date = new Date('2024-08-31T23:59:00.000'); //Using local time here to avoid 
    //     //conversions to UTC that could lead to a change of the intended month. 
    //     const result = SharedSystemHelper.getNthWeekDay(date, WeekDay.Monday, 1);
    //     expect(result.getTime()).toEqual((new Date('2024-08-05T23:59:00.000')).getTime());
    // });

    // test('should return the correct date for the 2nd Friday of August 2024', () => {
    //     const date = new Date('2024-08-01T00:00:00.000');
    //     const result = SharedSystemHelper.getNthWeekDay(date, WeekDay.Friday, 2);
    //     expect(result.getTime()).toEqual((new Date('2024-08-09T00:00:00.000')).getTime());

    // });

    // test('should return the correct date for the 3rd Wednesday of August 2024', () => {
    //     const date = new Date('2024-08-01T00:00:00.000');
    //     const result = SharedSystemHelper.getNthWeekDay(date, WeekDay.Wednesday, 3);
    //     expect(result.getTime()).toEqual((new Date('2024-08-21T00:00:00.000')).getTime());
    // });

    // test('should return the last occurrence if the ordinal is higher than possible occurrences in the month', () => {
    //     const date = new Date('2024-08-01T00:00:00.000');
    //     const result = SharedSystemHelper.getNthWeekDay(date, WeekDay.Friday, 6);
    //     expect(result.getTime()).toEqual((new Date('2024-08-30T00:00:00.000')).getTime()); // There are only 5 Fridays in August 2024.
    // });

    // test('should handle leap years correctly', () => {
    //     const date = new Date('2024-02-01T00:00:00.000');
    //     const result = SharedSystemHelper.getNthWeekDay(date, WeekDay.Monday, 5);
    //     // February 2024 is a leap year and it have only 4 Mondays:
    //     expect(result.getTime()).toEqual((new Date('2024-02-26T00:00:00.000')).getTime()); // There are only 5 Fridays in August 2024.
    // });

    test('should throw an error if the date is invalid', () => {
        expect(() => SharedSystemHelper.getNthWeekDay('invalid-date', WeekDay.Monday, 1))
            .toThrowError(`We expect a valid date value for parameter "date"`);
    });

    test('should throw an error if weekday is not a number', () => {
        expect(() => SharedSystemHelper.getNthWeekDay(new Date('2024-02-26T00:00:00.000'),
            "invalid" as unknown as number, 1))
            .toThrowError(`We expect a "number" type for the parameter "weekday"`);
    });

    test('should throw an error if ordinal is not a number', () => {
        expect(() => SharedSystemHelper.getNthWeekDay(new Date('2024-02-26T00:00:00.000'),
            WeekDay.Monday, "invalid" as unknown as number))
            .toThrowError(`We expect a "number" type for the parameter "ordinal"`);
    });

    test('should throw an error if ordinal is less than or equal to zero', () => {
        expect(() => SharedSystemHelper.getNthWeekDay(new Date('2024-02-26T00:00:00.000'),
            WeekDay.Monday, 0))
            .toThrowError(`We expect a numeric value greater than 0 for the parameter "ordinal"`);
    });

    test('should return the correct date for a string date input', () => {
        const date = '2024-08-01T00:00:00.000';
        const result = SharedSystemHelper.getNthWeekDay(date, WeekDay.Tuesday, 1);
        // There are only 5 Fridays in August 2024:
        expect(result.getTime()).toEqual((new Date('2024-08-06T00:00:00.000')).getTime());
    });

    // test('should return the correct date for the last Saturday of November 2024', () => {
    //     const date = new Date('2024-11-01T00:00:00.000');
    //     const result = SharedSystemHelper.getNthWeekDay(date, WeekDay.Saturday, 5);
    //     // November 2024 has 5 Saturdays:
    //     expect(result.getTime()).toEqual((new Date('2024-11-30T00:00:00.000')).getTime()); 
    // });

    // test('should return the 1st day of the month when is the first occurrence of the first weekday', () => {
    //     const date = new Date('2024-08-01T23:20:04.392');
    //     const result = SharedSystemHelper.getNthWeekDay(date, WeekDay.Thursday, 1);
    //     // First day of AUg 2024 is Thursday:
    //     expect(result.getTime()).toEqual((new Date('2024-08-01T23:20:04.392')).getTime()); 
    // });

    test('Month with 28 days with first weekday Monday - getting ordinal 1', () => {
        const sent = new Date('2021-02-23T13:13:48.000'); //Using local time here to avoid 
        //conversions to UTC that could lead to a change of the intended month.
        const expected = new Date('2021-02-01T13:13:48.000')
        const actual = SharedSystemHelper.getNthWeekDay(sent, WeekDay.Monday, 1);

        expect(expected.getTime()).toEqual(actual.getTime());
    });
    test('Month with 28 days with first weekday Monday - getting ordinal 2', () => {
        const sent = new Date('2021-02-07T18:07:26.000'); //Using local time here to avoid 
        //conversions to UTC that could lead to a change of the intended month.
        const expected = new Date('2021-02-08T18:07:26.000')
        const actual = SharedSystemHelper.getNthWeekDay(sent, WeekDay.Monday, 2);

        expect(expected.getTime()).toEqual(actual.getTime());
    });
    test('Month with 28 days with first weekday Monday - getting ordinal 3', () => {
        const sent = new Date('2021-02-23T10:44:35.000'); //Using local time here to avoid 
        //conversions to UTC that could lead to a change of the intended month.
        const expected = new Date('2021-02-15T10:44:35.000')
        const actual = SharedSystemHelper.getNthWeekDay(sent, WeekDay.Monday, 3);

        expect(expected.getTime()).toEqual(actual.getTime());
    });
    test('Month with 28 days with first weekday Monday - getting ordinal 4', () => {
        const sent = new Date('2021-02-23T20:59:19.000'); //Using local time here to avoid 
        //conversions to UTC that could lead to a change of the intended month.
        const expected = new Date('2021-02-22T20:59:19.000')
        const actual = SharedSystemHelper.getNthWeekDay(sent, WeekDay.Monday, 4);

        expect(expected.getTime()).toEqual(actual.getTime());
    });
    test('Month with 28 days with first weekday Monday - getting ordinal 5', () => {
        const sent = new Date('2021-02-24T14:34:55.000'); //Using local time here to avoid 
        //conversions to UTC that could lead to a change of the intended month.
        const expected = new Date('2021-02-22T14:34:55.000')
        const actual = SharedSystemHelper.getNthWeekDay(sent, WeekDay.Monday, 5);

        expect(expected.getTime()).toEqual(actual.getTime());
    });
    test('Month with 28 days with first weekday Wednesday - getting ordinal 1', () => {
        const sent = new Date('2023-02-26T00:33:07.000'); //Using local time here to avoid 
        //conversions to UTC that could lead to a change of the intended month.
        const expected = new Date('2023-02-01T00:33:07.000')
        const actual = SharedSystemHelper.getNthWeekDay(sent, WeekDay.Wednesday, 1);

        expect(expected.getTime()).toEqual(actual.getTime());
    });
    test('Month with 28 days with first weekday Wednesday - getting ordinal 2', () => {
        const sent = new Date('2023-02-20T07:26:53.000'); //Using local time here to avoid 
        //conversions to UTC that could lead to a change of the intended month.
        const expected = new Date('2023-02-08T07:26:53.000')
        const actual = SharedSystemHelper.getNthWeekDay(sent, WeekDay.Wednesday, 2);

        expect(expected.getTime()).toEqual(actual.getTime());
    });
    test('Month with 28 days with first weekday Wednesday - getting ordinal 3', () => {
        const sent = new Date('2023-02-11T21:15:02.000'); //Using local time here to avoid 
        //conversions to UTC that could lead to a change of the intended month.
        const expected = new Date('2023-02-15T21:15:02.000')
        const actual = SharedSystemHelper.getNthWeekDay(sent, WeekDay.Wednesday, 3);

        expect(expected.getTime()).toEqual(actual.getTime());
    });
    test('Month with 28 days with first weekday Wednesday - getting ordinal 4', () => {
        const sent = new Date('2023-02-19T16:12:48.000'); //Using local time here to avoid 
        //conversions to UTC that could lead to a change of the intended month.
        const expected = new Date('2023-02-22T16:12:48.000')
        const actual = SharedSystemHelper.getNthWeekDay(sent, WeekDay.Wednesday, 4);

        expect(expected.getTime()).toEqual(actual.getTime());
    });
    test('Month with 28 days with first weekday Wednesday - getting ordinal 5', () => {
        const sent = new Date('2023-02-02T20:42:37.000'); //Using local time here to avoid 
        //conversions to UTC that could lead to a change of the intended month.
        const expected = new Date('2023-02-22T20:42:37.000')
        const actual = SharedSystemHelper.getNthWeekDay(sent, WeekDay.Wednesday, 5);

        expect(expected.getTime()).toEqual(actual.getTime());
    });
    test('Month with 28 days with first weekday Sunday - getting ordinal 1', () => {
        const sent = new Date('2026-02-21T02:27:21.000'); //Using local time here to avoid 
        //conversions to UTC that could lead to a change of the intended month.
        const expected = new Date('2026-02-01T02:27:21.000')
        const actual = SharedSystemHelper.getNthWeekDay(sent, WeekDay.Sunday, 1);

        expect(expected.getTime()).toEqual(actual.getTime());
    });
    test('Month with 28 days with first weekday Sunday - getting ordinal 2', () => {
        const sent = new Date('2026-02-20T15:08:39.000'); //Using local time here to avoid 
        //conversions to UTC that could lead to a change of the intended month.
        const expected = new Date('2026-02-08T15:08:39.000')
        const actual = SharedSystemHelper.getNthWeekDay(sent, WeekDay.Sunday, 2);

        expect(expected.getTime()).toEqual(actual.getTime());
    });
    test('Month with 28 days with first weekday Sunday - getting ordinal 3', () => {
        const sent = new Date('2026-02-22T20:37:35.000'); //Using local time here to avoid 
        //conversions to UTC that could lead to a change of the intended month.
        const expected = new Date('2026-02-15T20:37:35.000')
        const actual = SharedSystemHelper.getNthWeekDay(sent, WeekDay.Sunday, 3);

        expect(expected.getTime()).toEqual(actual.getTime());
    });
    test('Month with 28 days with first weekday Sunday - getting ordinal 4', () => {
        const sent = new Date('2026-02-09T20:23:17.000'); //Using local time here to avoid 
        //conversions to UTC that could lead to a change of the intended month.
        const expected = new Date('2026-02-22T20:23:17.000')
        const actual = SharedSystemHelper.getNthWeekDay(sent, WeekDay.Sunday, 4);

        expect(expected.getTime()).toEqual(actual.getTime());
    });
    test('Month with 28 days with first weekday Sunday - getting ordinal 5', () => {
        const sent = new Date('2026-02-18T16:24:21.000'); //Using local time here to avoid 
        //conversions to UTC that could lead to a change of the intended month.
        const expected = new Date('2026-02-22T16:24:21.000')
        const actual = SharedSystemHelper.getNthWeekDay(sent, WeekDay.Sunday, 5);

        expect(expected.getTime()).toEqual(actual.getTime());
    });
    test('Month with 29 days with first weekday Monday - getting ordinal 1', () => {
        const sent = new Date('2016-02-17T21:21:04.000'); //Using local time here to avoid 
        //conversions to UTC that could lead to a change of the intended month.
        const expected = new Date('2016-02-01T21:21:04.000')
        const actual = SharedSystemHelper.getNthWeekDay(sent, WeekDay.Monday, 1);

        expect(expected.getTime()).toEqual(actual.getTime());
    });
    test('Month with 29 days with first weekday Monday - getting ordinal 2', () => {
        const sent = new Date('2016-02-26T19:08:22.000'); //Using local time here to avoid 
        //conversions to UTC that could lead to a change of the intended month.
        const expected = new Date('2016-02-08T19:08:22.000')
        const actual = SharedSystemHelper.getNthWeekDay(sent, WeekDay.Monday, 2);

        expect(expected.getTime()).toEqual(actual.getTime());
    });
    test('Month with 29 days with first weekday Monday - getting ordinal 3', () => {
        const sent = new Date('2016-02-15T16:53:06.000'); //Using local time here to avoid 
        //conversions to UTC that could lead to a change of the intended month.
        const expected = new Date('2016-02-15T16:53:06.000')
        const actual = SharedSystemHelper.getNthWeekDay(sent, WeekDay.Monday, 3);

        expect(expected.getTime()).toEqual(actual.getTime());
    });
    test('Month with 29 days with first weekday Monday - getting ordinal 4', () => {
        const sent = new Date('2016-02-09T10:38:57.000'); //Using local time here to avoid 
        //conversions to UTC that could lead to a change of the intended month.
        const expected = new Date('2016-02-22T10:38:57.000')
        const actual = SharedSystemHelper.getNthWeekDay(sent, WeekDay.Monday, 4);

        expect(expected.getTime()).toEqual(actual.getTime());
    });
    test('Month with 29 days with first weekday Monday - getting ordinal 5', () => {
        const sent = new Date('2016-02-13T01:47:42.000'); //Using local time here to avoid 
        //conversions to UTC that could lead to a change of the intended month.
        const expected = new Date('2016-02-29T01:47:42.000')
        const actual = SharedSystemHelper.getNthWeekDay(sent, WeekDay.Monday, 5);

        expect(expected.getTime()).toEqual(actual.getTime());
    });
    test('Month with 29 days with first weekday Wednesday - getting ordinal 1', () => {
        const sent = new Date('2012-02-25T08:03:08.000'); //Using local time here to avoid 
        //conversions to UTC that could lead to a change of the intended month.
        const expected = new Date('2012-02-01T08:03:08.000')
        const actual = SharedSystemHelper.getNthWeekDay(sent, WeekDay.Wednesday, 1);

        expect(expected.getTime()).toEqual(actual.getTime());
    });
    test('Month with 29 days with first weekday Wednesday - getting ordinal 2', () => {
        const sent = new Date('2012-02-02T19:49:55.000'); //Using local time here to avoid 
        //conversions to UTC that could lead to a change of the intended month.
        const expected = new Date('2012-02-08T19:49:55.000')
        const actual = SharedSystemHelper.getNthWeekDay(sent, WeekDay.Wednesday, 2);

        expect(expected.getTime()).toEqual(actual.getTime());
    });
    test('Month with 29 days with first weekday Wednesday - getting ordinal 3', () => {
        const sent = new Date('2012-02-17T00:29:42.000'); //Using local time here to avoid 
        //conversions to UTC that could lead to a change of the intended month.
        const expected = new Date('2012-02-15T00:29:42.000')
        const actual = SharedSystemHelper.getNthWeekDay(sent, WeekDay.Wednesday, 3);

        expect(expected.getTime()).toEqual(actual.getTime());
    });
    test('Month with 29 days with first weekday Wednesday - getting ordinal 4', () => {
        const sent = new Date('2012-02-08T06:51:39.000'); //Using local time here to avoid 
        //conversions to UTC that could lead to a change of the intended month.
        const expected = new Date('2012-02-22T06:51:39.000')
        const actual = SharedSystemHelper.getNthWeekDay(sent, WeekDay.Wednesday, 4);

        expect(expected.getTime()).toEqual(actual.getTime());
    });
    test('Month with 29 days with first weekday Wednesday - getting ordinal 5', () => {
        const sent = new Date('2012-02-02T21:11:01.000'); //Using local time here to avoid 
        //conversions to UTC that could lead to a change of the intended month.
        const expected = new Date('2012-02-29T21:11:01.000')
        const actual = SharedSystemHelper.getNthWeekDay(sent, WeekDay.Wednesday, 5);

        expect(expected.getTime()).toEqual(actual.getTime());
    });
    test('Month with 29 days with first weekday Sunday - getting ordinal 1', () => {
        const sent = new Date('2004-02-15T13:09:10.000'); //Using local time here to avoid 
        //conversions to UTC that could lead to a change of the intended month.
        const expected = new Date('2004-02-01T13:09:10.000')
        const actual = SharedSystemHelper.getNthWeekDay(sent, WeekDay.Sunday, 1);

        expect(expected.getTime()).toEqual(actual.getTime());
    });
    test('Month with 29 days with first weekday Sunday - getting ordinal 2', () => {
        const sent = new Date('2004-02-18T17:22:22.000'); //Using local time here to avoid 
        //conversions to UTC that could lead to a change of the intended month.
        const expected = new Date('2004-02-08T17:22:22.000')
        const actual = SharedSystemHelper.getNthWeekDay(sent, WeekDay.Sunday, 2);

        expect(expected.getTime()).toEqual(actual.getTime());
    });
    test('Month with 29 days with first weekday Sunday - getting ordinal 3', () => {
        const sent = new Date('2004-02-20T23:53:53.000'); //Using local time here to avoid 
        //conversions to UTC that could lead to a change of the intended month.
        const expected = new Date('2004-02-15T23:53:53.000')
        const actual = SharedSystemHelper.getNthWeekDay(sent, WeekDay.Sunday, 3);

        expect(expected.getTime()).toEqual(actual.getTime());
    });
    test('Month with 29 days with first weekday Sunday - getting ordinal 4', () => {
        const sent = new Date('2004-02-28T14:29:57.000'); //Using local time here to avoid 
        //conversions to UTC that could lead to a change of the intended month.
        const expected = new Date('2004-02-22T14:29:57.000')
        const actual = SharedSystemHelper.getNthWeekDay(sent, WeekDay.Sunday, 4);

        expect(expected.getTime()).toEqual(actual.getTime());
    });
    test('Month with 29 days with first weekday Sunday - getting ordinal 5', () => {
        const sent = new Date('2004-02-28T09:22:48.000'); //Using local time here to avoid 
        //conversions to UTC that could lead to a change of the intended month.
        const expected = new Date('2004-02-29T09:22:48.000')
        const actual = SharedSystemHelper.getNthWeekDay(sent, WeekDay.Sunday, 5);

        expect(expected.getTime()).toEqual(actual.getTime());
    });
    test('Month with 30 days with first weekday Monday - getting ordinal 1', () => {
        const sent = new Date('1999-11-10T23:37:46.000'); //Using local time here to avoid 
        //conversions to UTC that could lead to a change of the intended month.
        const expected = new Date('1999-11-01T23:37:46.000')
        const actual = SharedSystemHelper.getNthWeekDay(sent, WeekDay.Monday, 1);

        expect(expected.getTime()).toEqual(actual.getTime());
    });
    test('Month with 30 days with first weekday Monday - getting ordinal 2', () => {
        const sent = new Date('1999-11-07T04:25:26.000'); //Using local time here to avoid 
        //conversions to UTC that could lead to a change of the intended month.
        const expected = new Date('1999-11-08T04:25:26.000')
        const actual = SharedSystemHelper.getNthWeekDay(sent, WeekDay.Monday, 2);

        expect(expected.getTime()).toEqual(actual.getTime());
    });
    test('Month with 30 days with first weekday Monday - getting ordinal 3', () => {
        const sent = new Date('1999-11-20T13:39:20.000'); //Using local time here to avoid 
        //conversions to UTC that could lead to a change of the intended month.
        const expected = new Date('1999-11-15T13:39:20.000')
        const actual = SharedSystemHelper.getNthWeekDay(sent, WeekDay.Monday, 3);

        expect(expected.getTime()).toEqual(actual.getTime());
    });
    test('Month with 30 days with first weekday Monday - getting ordinal 4', () => {
        const sent = new Date('1999-11-17T00:07:55.000'); //Using local time here to avoid 
        //conversions to UTC that could lead to a change of the intended month.
        const expected = new Date('1999-11-22T00:07:55.000')
        const actual = SharedSystemHelper.getNthWeekDay(sent, WeekDay.Monday, 4);

        expect(expected.getTime()).toEqual(actual.getTime());
    });
    test('Month with 30 days with first weekday Monday - getting ordinal 5', () => {
        const sent = new Date('1999-11-23T23:20:33.000'); //Using local time here to avoid 
        //conversions to UTC that could lead to a change of the intended month.
        const expected = new Date('1999-11-29T23:20:33.000')
        const actual = SharedSystemHelper.getNthWeekDay(sent, WeekDay.Monday, 5);

        expect(expected.getTime()).toEqual(actual.getTime());
    });
    test('Month with 30 days with first weekday Wednesday - getting ordinal 1', () => {
        const sent = new Date('2016-06-13T06:01:05.000'); //Using local time here to avoid 
        //conversions to UTC that could lead to a change of the intended month.
        const expected = new Date('2016-06-01T06:01:05.000')
        const actual = SharedSystemHelper.getNthWeekDay(sent, WeekDay.Wednesday, 1);

        expect(expected.getTime()).toEqual(actual.getTime());
    });
    test('Month with 30 days with first weekday Wednesday - getting ordinal 2', () => {
        const sent = new Date('2016-06-03T19:41:09.000'); //Using local time here to avoid 
        //conversions to UTC that could lead to a change of the intended month.
        const expected = new Date('2016-06-08T19:41:09.000')
        const actual = SharedSystemHelper.getNthWeekDay(sent, WeekDay.Wednesday, 2);

        expect(expected.getTime()).toEqual(actual.getTime());
    });
    test('Month with 30 days with first weekday Wednesday - getting ordinal 3', () => {
        const sent = new Date('2016-06-08T22:28:22.000'); //Using local time here to avoid 
        //conversions to UTC that could lead to a change of the intended month.
        const expected = new Date('2016-06-15T22:28:22.000')
        const actual = SharedSystemHelper.getNthWeekDay(sent, WeekDay.Wednesday, 3);

        expect(expected.getTime()).toEqual(actual.getTime());
    });
    test('Month with 30 days with first weekday Wednesday - getting ordinal 4', () => {
        const sent = new Date('2016-06-12T05:13:56.000'); //Using local time here to avoid 
        //conversions to UTC that could lead to a change of the intended month.
        const expected = new Date('2016-06-22T05:13:56.000')
        const actual = SharedSystemHelper.getNthWeekDay(sent, WeekDay.Wednesday, 4);

        expect(expected.getTime()).toEqual(actual.getTime());
    });
    test('Month with 30 days with first weekday Wednesday - getting ordinal 5', () => {
        const sent = new Date('2016-06-15T19:52:20.000'); //Using local time here to avoid 
        //conversions to UTC that could lead to a change of the intended month.
        const expected = new Date('2016-06-29T19:52:20.000')
        const actual = SharedSystemHelper.getNthWeekDay(sent, WeekDay.Wednesday, 5);

        expect(expected.getTime()).toEqual(actual.getTime());
    });
    test('Month with 30 days with first weekday Sunday - getting ordinal 1', () => {
        const sent = new Date('1996-09-04T13:00:40.000'); //Using local time here to avoid 
        //conversions to UTC that could lead to a change of the intended month.
        const expected = new Date('1996-09-01T13:00:40.000')
        const actual = SharedSystemHelper.getNthWeekDay(sent, WeekDay.Sunday, 1);

        expect(expected.getTime()).toEqual(actual.getTime());
    });
    test('Month with 30 days with first weekday Sunday - getting ordinal 2', () => {
        const sent = new Date('1996-09-04T23:01:48.000'); //Using local time here to avoid 
        //conversions to UTC that could lead to a change of the intended month.
        const expected = new Date('1996-09-08T23:01:48.000')
        const actual = SharedSystemHelper.getNthWeekDay(sent, WeekDay.Sunday, 2);

        expect(expected.getTime()).toEqual(actual.getTime());
    });
    test('Month with 30 days with first weekday Sunday - getting ordinal 3', () => {
        const sent = new Date('1996-09-07T11:30:23.000'); //Using local time here to avoid 
        //conversions to UTC that could lead to a change of the intended month.
        const expected = new Date('1996-09-15T11:30:23.000')
        const actual = SharedSystemHelper.getNthWeekDay(sent, WeekDay.Sunday, 3);

        expect(expected.getTime()).toEqual(actual.getTime());
    });
    test('Month with 30 days with first weekday Sunday - getting ordinal 4', () => {
        const sent = new Date('1996-09-24T01:20:40.000'); //Using local time here to avoid 
        //conversions to UTC that could lead to a change of the intended month.
        const expected = new Date('1996-09-22T01:20:40.000')
        const actual = SharedSystemHelper.getNthWeekDay(sent, WeekDay.Sunday, 4);

        expect(expected.getTime()).toEqual(actual.getTime());
    });
    test('Month with 30 days with first weekday Sunday - getting ordinal 5', () => {
        const sent = new Date('1996-09-10T08:57:01.000'); //Using local time here to avoid 
        //conversions to UTC that could lead to a change of the intended month.
        const expected = new Date('1996-09-29T08:57:01.000')
        const actual = SharedSystemHelper.getNthWeekDay(sent, WeekDay.Sunday, 5);

        expect(expected.getTime()).toEqual(actual.getTime());
    });
    test('Month with 31 days with first weekday Monday - getting ordinal 1', () => {
        const sent = new Date('2016-08-19T21:19:03.000'); //Using local time here to avoid 
        //conversions to UTC that could lead to a change of the intended month.
        const expected = new Date('2016-08-01T21:19:03.000')
        const actual = SharedSystemHelper.getNthWeekDay(sent, WeekDay.Monday, 1);

        expect(expected.getTime()).toEqual(actual.getTime());
    });
    test('Month with 31 days with first weekday Monday - getting ordinal 2', () => {
        const sent = new Date('2016-08-04T00:25:48.000'); //Using local time here to avoid 
        //conversions to UTC that could lead to a change of the intended month.
        const expected = new Date('2016-08-08T00:25:48.000')
        const actual = SharedSystemHelper.getNthWeekDay(sent, WeekDay.Monday, 2);

        expect(expected.getTime()).toEqual(actual.getTime());
    });
    test('Month with 31 days with first weekday Monday - getting ordinal 3', () => {
        const sent = new Date('2016-08-05T18:33:48.000'); //Using local time here to avoid 
        //conversions to UTC that could lead to a change of the intended month.
        const expected = new Date('2016-08-15T18:33:48.000')
        const actual = SharedSystemHelper.getNthWeekDay(sent, WeekDay.Monday, 3);

        expect(expected.getTime()).toEqual(actual.getTime());
    });
    test('Month with 31 days with first weekday Monday - getting ordinal 4', () => {
        const sent = new Date('2016-08-26T13:21:17.000'); //Using local time here to avoid 
        //conversions to UTC that could lead to a change of the intended month.
        const expected = new Date('2016-08-22T13:21:17.000')
        const actual = SharedSystemHelper.getNthWeekDay(sent, WeekDay.Monday, 4);

        expect(expected.getTime()).toEqual(actual.getTime());
    });
    test('Month with 31 days with first weekday Monday - getting ordinal 5', () => {
        const sent = new Date('2016-08-16T04:05:49.000'); //Using local time here to avoid 
        //conversions to UTC that could lead to a change of the intended month.
        const expected = new Date('2016-08-29T04:05:49.000')
        const actual = SharedSystemHelper.getNthWeekDay(sent, WeekDay.Monday, 5);

        expect(expected.getTime()).toEqual(actual.getTime());
    });
    test('Month with 31 days with first weekday Wednesday - getting ordinal 1', () => {
        const sent = new Date('1996-05-14T00:28:25.000'); //Using local time here to avoid 
        //conversions to UTC that could lead to a change of the intended month.
        const expected = new Date('1996-05-01T00:28:25.000')
        const actual = SharedSystemHelper.getNthWeekDay(sent, WeekDay.Wednesday, 1);

        expect(expected.getTime()).toEqual(actual.getTime());
    });
    test('Month with 31 days with first weekday Wednesday - getting ordinal 2', () => {
        const sent = new Date('1996-05-08T12:06:46.000'); //Using local time here to avoid 
        //conversions to UTC that could lead to a change of the intended month.
        const expected = new Date('1996-05-08T12:06:46.000')
        const actual = SharedSystemHelper.getNthWeekDay(sent, WeekDay.Wednesday, 2);

        expect(expected.getTime()).toEqual(actual.getTime());
    });
    test('Month with 31 days with first weekday Wednesday - getting ordinal 3', () => {
        const sent = new Date('1996-05-20T15:06:45.000'); //Using local time here to avoid 
        //conversions to UTC that could lead to a change of the intended month.
        const expected = new Date('1996-05-15T15:06:45.000')
        const actual = SharedSystemHelper.getNthWeekDay(sent, WeekDay.Wednesday, 3);

        expect(expected.getTime()).toEqual(actual.getTime());
    });
    test('Month with 31 days with first weekday Wednesday - getting ordinal 4', () => {
        const sent = new Date('1996-05-07T06:29:28.000'); //Using local time here to avoid 
        //conversions to UTC that could lead to a change of the intended month.
        const expected = new Date('1996-05-22T06:29:28.000')
        const actual = SharedSystemHelper.getNthWeekDay(sent, WeekDay.Wednesday, 4);

        expect(expected.getTime()).toEqual(actual.getTime());
    });
    test('Month with 31 days with first weekday Wednesday - getting ordinal 5', () => {
        const sent = new Date('1996-05-07T12:41:14.000'); //Using local time here to avoid 
        //conversions to UTC that could lead to a change of the intended month.
        const expected = new Date('1996-05-29T12:41:14.000')
        const actual = SharedSystemHelper.getNthWeekDay(sent, WeekDay.Wednesday, 5);

        expect(expected.getTime()).toEqual(actual.getTime());
    });
    test('Month with 31 days with first weekday Sunday - getting ordinal 1', () => {
        const sent = new Date('2016-05-22T13:59:29.000'); //Using local time here to avoid 
        //conversions to UTC that could lead to a change of the intended month.
        const expected = new Date('2016-05-01T13:59:29.000')
        const actual = SharedSystemHelper.getNthWeekDay(sent, WeekDay.Sunday, 1);

        expect(expected.getTime()).toEqual(actual.getTime());
    });
    test('Month with 31 days with first weekday Sunday - getting ordinal 2', () => {
        const sent = new Date('2016-05-09T12:52:37.000'); //Using local time here to avoid 
        //conversions to UTC that could lead to a change of the intended month.
        const expected = new Date('2016-05-08T12:52:37.000')
        const actual = SharedSystemHelper.getNthWeekDay(sent, WeekDay.Sunday, 2);

        expect(expected.getTime()).toEqual(actual.getTime());
    });
    test('Month with 31 days with first weekday Sunday - getting ordinal 3', () => {
        const sent = new Date('2016-05-20T02:28:50.000'); //Using local time here to avoid 
        //conversions to UTC that could lead to a change of the intended month.
        const expected = new Date('2016-05-15T02:28:50.000')
        const actual = SharedSystemHelper.getNthWeekDay(sent, WeekDay.Sunday, 3);

        expect(expected.getTime()).toEqual(actual.getTime());
    });
    test('Month with 31 days with first weekday Sunday - getting ordinal 4', () => {
        const sent = new Date('2016-05-26T00:36:31.000'); //Using local time here to avoid 
        //conversions to UTC that could lead to a change of the intended month.
        const expected = new Date('2016-05-22T00:36:31.000')
        const actual = SharedSystemHelper.getNthWeekDay(sent, WeekDay.Sunday, 4);

        expect(expected.getTime()).toEqual(actual.getTime());
    });
    test('Month with 31 days with first weekday Sunday - getting ordinal 5', () => {
        const sent = new Date('2016-05-22T22:16:32.000'); //Using local time here to avoid 
        //conversions to UTC that could lead to a change of the intended month.
        const expected = new Date('2016-05-29T22:16:32.000')
        const actual = SharedSystemHelper.getNthWeekDay(sent, WeekDay.Sunday, 5);

        expect(expected.getTime()).toEqual(actual.getTime());
    });
})
