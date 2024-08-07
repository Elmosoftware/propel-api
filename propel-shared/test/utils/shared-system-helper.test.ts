import { SharedSystemHelper } from "../../utils/shared-system-helper";

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
