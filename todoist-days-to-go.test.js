// Comprehensive test suite for Todoist Days To Go
const {
    LANGUAGES,
    DEFAULT_CONFIG,
    getLang,
    getToday,
    parseDate,
    getDaysDiff,
    formatDaysText,
    getDaysColor,
    parseDateFromText
} = require('./todoist-days-to-go.js');

describe('LANGUAGES', () => {
    test('should have all required languages', () => {
        expect(LANGUAGES).toHaveProperty('ja');
        expect(LANGUAGES).toHaveProperty('en');
        expect(LANGUAGES).toHaveProperty('zh');
    });

    test('Japanese language should have all required properties', () => {
        const ja = LANGUAGES.ja;
        expect(ja).toHaveProperty('today', '今日');
        expect(ja).toHaveProperty('tomorrow', '明日');
        expect(ja).toHaveProperty('yesterday', '昨日');
        expect(ja.daysAgo(3)).toBe('3日前');
        expect(ja.daysLater(5)).toBe('5日後');
        expect(ja.daysRemaining(7)).toBe('あと7日');
        expect(ja.dMinus(10)).toBe('D-10');
        expect(ja.datePattern).toBeInstanceOf(RegExp);
        expect(ja.dateKeywords).toBeInstanceOf(RegExp);
    });

    test('English language should have all required properties', () => {
        const en = LANGUAGES.en;
        expect(en).toHaveProperty('today', 'Today');
        expect(en).toHaveProperty('tomorrow', 'Tomorrow');
        expect(en).toHaveProperty('yesterday', 'Yesterday');
        expect(en.daysAgo(3)).toBe('3d ago');
        expect(en.daysLater(5)).toBe('in 5d');
        expect(en.daysRemaining(7)).toBe('7d left');
        expect(en.dMinus(10)).toBe('D-10');
        expect(en.datePattern).toBeInstanceOf(RegExp);
        expect(en.dateKeywords).toBeInstanceOf(RegExp);
    });

    test('Chinese language should have all required properties', () => {
        const zh = LANGUAGES.zh;
        expect(zh).toHaveProperty('today', '今天');
        expect(zh).toHaveProperty('tomorrow', '明天');
        expect(zh).toHaveProperty('yesterday', '昨天');
        expect(zh.daysAgo(3)).toBe('3天前');
        expect(zh.daysLater(5)).toBe('5天后');
        expect(zh.daysRemaining(7)).toBe('还剩7天');
        expect(zh.dMinus(10)).toBe('D-10');
        expect(zh.datePattern).toBeInstanceOf(RegExp);
        expect(zh.dateKeywords).toBeInstanceOf(RegExp);
    });
});

describe('DEFAULT_CONFIG', () => {
    test('should have correct default values', () => {
        expect(DEFAULT_CONFIG.language).toBe('ja');
        expect(DEFAULT_CONFIG.format).toBe('before');
        expect(DEFAULT_CONFIG.updateInterval).toBe(1000);
        expect(DEFAULT_CONFIG.debug).toBe(false);
    });
});

describe('getLang()', () => {
    test('should return Japanese by default', () => {
        const lang = getLang();
        expect(lang).toBe(LANGUAGES.ja);
    });

    test('should return correct language based on config', () => {
        expect(getLang({ language: 'ja' })).toBe(LANGUAGES.ja);
        expect(getLang({ language: 'en' })).toBe(LANGUAGES.en);
        expect(getLang({ language: 'zh' })).toBe(LANGUAGES.zh);
    });

    test('should fallback to Japanese for invalid language', () => {
        const lang = getLang({ language: 'invalid' });
        expect(lang).toBe(LANGUAGES.ja);
    });
});

describe('getToday()', () => {
    test('should return today\'s date with time set to 00:00:00', () => {
        const today = getToday();
        expect(today).toBeInstanceOf(Date);
        expect(today.getHours()).toBe(0);
        expect(today.getMinutes()).toBe(0);
        expect(today.getSeconds()).toBe(0);
        expect(today.getMilliseconds()).toBe(0);
    });

    test('should return date matching current date', () => {
        const today = getToday();
        const now = new Date();
        expect(today.getFullYear()).toBe(now.getFullYear());
        expect(today.getMonth()).toBe(now.getMonth());
        expect(today.getDate()).toBe(now.getDate());
    });
});

describe('parseDate()', () => {
    test('should parse valid YYYY-MM-DD date string', () => {
        const date = parseDate('2026-03-15');
        expect(date).toBeInstanceOf(Date);
        expect(date.getFullYear()).toBe(2026);
        expect(date.getMonth()).toBe(2); // March is 2 (0-indexed)
        expect(date.getDate()).toBe(15);
    });

    test('should parse date with leading zeros', () => {
        const date = parseDate('2026-01-05');
        expect(date).toBeInstanceOf(Date);
        expect(date.getFullYear()).toBe(2026);
        expect(date.getMonth()).toBe(0); // January is 0
        expect(date.getDate()).toBe(5);
    });

    test('should parse date at year boundary', () => {
        const date = parseDate('2025-12-31');
        expect(date).toBeInstanceOf(Date);
        expect(date.getFullYear()).toBe(2025);
        expect(date.getMonth()).toBe(11); // December is 11
        expect(date.getDate()).toBe(31);
    });

    test('should return null for invalid date string', () => {
        expect(parseDate('invalid')).toBeNull();
        expect(parseDate('2026/03/15')).toBeNull();
        expect(parseDate('15-03-2026')).toBeNull();
    });

    test('should return null for empty string', () => {
        expect(parseDate('')).toBeNull();
    });

    test('should return null for null input', () => {
        expect(parseDate(null)).toBeNull();
    });
});

describe('getDaysDiff()', () => {
    // Fixed reference date for consistent testing
    const referenceDate = new Date(2026, 2, 1); // March 1, 2026

    test('should return 0 for same day', () => {
        const targetDate = new Date(2026, 2, 1);
        expect(getDaysDiff(targetDate, referenceDate)).toBe(0);
    });

    test('should return positive number for future dates', () => {
        const targetDate = new Date(2026, 2, 8); // March 8, 2026
        expect(getDaysDiff(targetDate, referenceDate)).toBe(7);
    });

    test('should return negative number for past dates', () => {
        const targetDate = new Date(2026, 1, 22); // Feb 22, 2026
        expect(getDaysDiff(targetDate, referenceDate)).toBe(-7);
    });

    test('should return 1 for tomorrow', () => {
        const targetDate = new Date(2026, 2, 2);
        expect(getDaysDiff(targetDate, referenceDate)).toBe(1);
    });

    test('should return -1 for yesterday', () => {
        const targetDate = new Date(2026, 1, 28); // Feb 28, 2026
        expect(getDaysDiff(targetDate, referenceDate)).toBe(-1);
    });

    test('should handle month boundaries correctly', () => {
        const targetDate = new Date(2026, 3, 1); // April 1, 2026
        expect(getDaysDiff(targetDate, referenceDate)).toBe(31);
    });

    test('should handle year boundaries correctly', () => {
        const refDate = new Date(2025, 11, 31); // Dec 31, 2025
        const targetDate = new Date(2026, 0, 1); // Jan 1, 2026
        expect(getDaysDiff(targetDate, refDate)).toBe(1);
    });

    test('should handle leap year correctly', () => {
        const refDate = new Date(2024, 1, 28); // Feb 28, 2024 (leap year)
        const targetDate = new Date(2024, 2, 1); // March 1, 2024
        expect(getDaysDiff(targetDate, refDate)).toBe(2); // Feb 29 exists
    });

    test('should handle large date differences', () => {
        const targetDate = new Date(2027, 2, 1); // One year later
        expect(getDaysDiff(targetDate, referenceDate)).toBe(365);
    });

    test('should use Math.round for proper rounding', () => {
        // Create dates with time components to test rounding
        const refDate = new Date(2026, 2, 1, 12, 0, 0); // noon
        const targetDate = new Date(2026, 2, 2, 6, 0, 0); // 18 hours later (0.75 days)
        // Should round to 1 day
        expect(getDaysDiff(targetDate, refDate)).toBe(1);
    });
});

describe('formatDaysText()', () => {
    describe('Japanese format', () => {
        const config = { ...DEFAULT_CONFIG, language: 'ja' };

        test('should format today correctly', () => {
            expect(formatDaysText(0, config)).toBe('今日');
        });

        test('should format tomorrow correctly', () => {
            expect(formatDaysText(1, config)).toBe('明日');
        });

        test('should format yesterday correctly', () => {
            expect(formatDaysText(-1, config)).toBe('昨日');
        });

        test('should format past dates correctly', () => {
            expect(formatDaysText(-3, config)).toBe('3日前');
            expect(formatDaysText(-10, config)).toBe('10日前');
        });

        test('should format future dates with "before" format', () => {
            const beforeConfig = { ...config, format: 'before' };
            expect(formatDaysText(3, beforeConfig)).toBe('3日後');
            expect(formatDaysText(10, beforeConfig)).toBe('10日後');
        });

        test('should format future dates with "after" format', () => {
            const afterConfig = { ...config, format: 'after' };
            expect(formatDaysText(3, afterConfig)).toBe('あと3日');
            expect(formatDaysText(10, afterConfig)).toBe('あと10日');
        });

        test('should format future dates with "D-" format', () => {
            const dMinusConfig = { ...config, format: 'D-' };
            expect(formatDaysText(3, dMinusConfig)).toBe('D-3');
            expect(formatDaysText(10, dMinusConfig)).toBe('D-10');
        });
    });

    describe('English format', () => {
        const config = { ...DEFAULT_CONFIG, language: 'en' };

        test('should format today correctly', () => {
            expect(formatDaysText(0, config)).toBe('Today');
        });

        test('should format tomorrow correctly', () => {
            expect(formatDaysText(1, config)).toBe('Tomorrow');
        });

        test('should format yesterday correctly', () => {
            expect(formatDaysText(-1, config)).toBe('Yesterday');
        });

        test('should format past dates correctly', () => {
            expect(formatDaysText(-3, config)).toBe('3d ago');
            expect(formatDaysText(-10, config)).toBe('10d ago');
        });

        test('should format future dates with "before" format', () => {
            const beforeConfig = { ...config, format: 'before' };
            expect(formatDaysText(3, beforeConfig)).toBe('in 3d');
            expect(formatDaysText(10, beforeConfig)).toBe('in 10d');
        });

        test('should format future dates with "after" format', () => {
            const afterConfig = { ...config, format: 'after' };
            expect(formatDaysText(3, afterConfig)).toBe('3d left');
            expect(formatDaysText(10, afterConfig)).toBe('10d left');
        });

        test('should format future dates with "D-" format', () => {
            const dMinusConfig = { ...config, format: 'D-' };
            expect(formatDaysText(3, dMinusConfig)).toBe('D-3');
            expect(formatDaysText(10, dMinusConfig)).toBe('D-10');
        });
    });

    describe('Chinese format', () => {
        const config = { ...DEFAULT_CONFIG, language: 'zh' };

        test('should format today correctly', () => {
            expect(formatDaysText(0, config)).toBe('今天');
        });

        test('should format tomorrow correctly', () => {
            expect(formatDaysText(1, config)).toBe('明天');
        });

        test('should format yesterday correctly', () => {
            expect(formatDaysText(-1, config)).toBe('昨天');
        });

        test('should format past dates correctly', () => {
            expect(formatDaysText(-3, config)).toBe('3天前');
            expect(formatDaysText(-10, config)).toBe('10天前');
        });

        test('should format future dates with "before" format', () => {
            const beforeConfig = { ...config, format: 'before' };
            expect(formatDaysText(3, beforeConfig)).toBe('3天后');
            expect(formatDaysText(10, beforeConfig)).toBe('10天后');
        });

        test('should format future dates with "after" format', () => {
            const afterConfig = { ...config, format: 'after' };
            expect(formatDaysText(3, afterConfig)).toBe('还剩3天');
            expect(formatDaysText(10, afterConfig)).toBe('还剩10天');
        });

        test('should format future dates with "D-" format', () => {
            const dMinusConfig = { ...config, format: 'D-' };
            expect(formatDaysText(3, dMinusConfig)).toBe('D-3');
            expect(formatDaysText(10, dMinusConfig)).toBe('D-10');
        });
    });

    test('should default to "before" format for unknown format', () => {
        const config = { ...DEFAULT_CONFIG, format: 'unknown' };
        expect(formatDaysText(5, config)).toBe('5日後');
    });
});

describe('getDaysColor()', () => {
    test('should return red for overdue tasks', () => {
        expect(getDaysColor(-1)).toBe('#d1453b');
        expect(getDaysColor(-5)).toBe('#d1453b');
        expect(getDaysColor(-100)).toBe('#d1453b');
    });

    test('should return red for today', () => {
        expect(getDaysColor(0)).toBe('#d1453b');
    });

    test('should return orange for tasks within 3 days', () => {
        expect(getDaysColor(1)).toBe('#eb8909');
        expect(getDaysColor(2)).toBe('#eb8909');
        expect(getDaysColor(3)).toBe('#eb8909');
    });

    test('should return blue for tasks within 1 week', () => {
        expect(getDaysColor(4)).toBe('#246fe0');
        expect(getDaysColor(5)).toBe('#246fe0');
        expect(getDaysColor(6)).toBe('#246fe0');
        expect(getDaysColor(7)).toBe('#246fe0');
    });

    test('should return gray for tasks beyond 1 week', () => {
        expect(getDaysColor(8)).toBe('#808080');
        expect(getDaysColor(14)).toBe('#808080');
        expect(getDaysColor(30)).toBe('#808080');
        expect(getDaysColor(365)).toBe('#808080');
    });
});

describe('parseDateFromText()', () => {
    describe('Japanese date parsing', () => {
        const config = { ...DEFAULT_CONFIG, language: 'ja' };

        test('should parse single Japanese date', () => {
            const result = parseDateFromText('タスク 3月15日 締切', config);
            expect(result).not.toBeNull();
            expect(result.date).toMatch(/^\d{4}-03-15$/);
            expect(result.type).toBe('deadline');
        });

        test('should parse date with single digit month', () => {
            const result = parseDateFromText('タスク 3月5日', config);
            expect(result).not.toBeNull();
            expect(result.date).toMatch(/^\d{4}-03-05$/);
        });

        test('should use last date when multiple dates present', () => {
            const result = parseDateFromText('開始 2月1日 締切 3月15日', config);
            expect(result).not.toBeNull();
            expect(result.date).toMatch(/^\d{4}-03-15$/);
        });

        test('should handle year boundary (assume next year for past dates)', () => {
            // Mock current date to be December
            const originalDate = Date;
            global.Date = class extends Date {
                constructor(...args) {
                    if (args.length === 0) {
                        super(2025, 11, 15); // Dec 15, 2025
                    } else {
                        super(...args);
                    }
                }
            };

            const result = parseDateFromText('タスク 1月10日', config);

            // Restore original Date
            global.Date = originalDate;

            expect(result).not.toBeNull();
            expect(result.date).toBe('2026-01-10'); // Should be next year
        });

        test('should return null for no date match', () => {
            const result = parseDateFromText('タスク without date', config);
            expect(result).toBeNull();
        });
    });

    describe('English date parsing', () => {
        const config = { ...DEFAULT_CONFIG, language: 'en' };

        test('should parse English month name with day', () => {
            const result = parseDateFromText('Task due Mar 15', config);
            expect(result).not.toBeNull();
            expect(result.date).toMatch(/^\d{4}-03-15$/);
            expect(result.type).toBe('deadline');
        });

        test('should parse full month name', () => {
            const result = parseDateFromText('Deadline: March 15', config);
            expect(result).not.toBeNull();
            expect(result.date).toMatch(/^\d{4}-03-15$/);
        });

        test('should parse day before month', () => {
            const result = parseDateFromText('Due: 15 Mar', config);
            expect(result).not.toBeNull();
            expect(result.date).toMatch(/^\d{4}-03-15$/);
        });

        test('should parse abbreviated months', () => {
            const months = [
                ['Jan', '01'], ['Feb', '02'], ['Mar', '03'], ['Apr', '04'],
                ['May', '05'], ['Jun', '06'], ['Jul', '07'], ['Aug', '08'],
                ['Sep', '09'], ['Oct', '10'], ['Nov', '11'], ['Dec', '12']
            ];

            months.forEach(([monthName, monthNum]) => {
                const result = parseDateFromText(`Task ${monthName} 15`, config);
                expect(result).not.toBeNull();
                expect(result.date).toMatch(new RegExp(`^\\d{4}-${monthNum}-15$`));
            });
        });

        test('should use last date when multiple dates present', () => {
            const result = parseDateFromText('Start Feb 1, Due Mar 15', config);
            expect(result).not.toBeNull();
            expect(result.date).toMatch(/^\d{4}-03-15$/);
        });

        test('should return null for no date match', () => {
            const result = parseDateFromText('Task without date', config);
            expect(result).toBeNull();
        });
    });

    describe('Chinese date parsing', () => {
        const config = { ...DEFAULT_CONFIG, language: 'zh' };

        test('should parse Chinese date format', () => {
            const result = parseDateFromText('任务 3月15日 截止', config);
            expect(result).not.toBeNull();
            expect(result.date).toMatch(/^\d{4}-03-15$/);
            expect(result.type).toBe('deadline');
        });

        test('should parse single digit dates', () => {
            const result = parseDateFromText('任务 3月5日', config);
            expect(result).not.toBeNull();
            expect(result.date).toMatch(/^\d{4}-03-05$/);
        });

        test('should use last date when multiple dates present', () => {
            const result = parseDateFromText('开始 2月1日 截止 3月15日', config);
            expect(result).not.toBeNull();
            expect(result.date).toMatch(/^\d{4}-03-15$/);
        });

        test('should return null for no date match', () => {
            const result = parseDateFromText('没有日期的任务', config);
            expect(result).toBeNull();
        });
    });

    describe('Edge cases', () => {
        test('should return null for empty string', () => {
            expect(parseDateFromText('', DEFAULT_CONFIG)).toBeNull();
        });

        test('should handle invalid month/day combinations', () => {
            const config = { ...DEFAULT_CONFIG, language: 'ja' };
            // Invalid day (0)
            const text = '0月0日'; // This will parse but might be invalid
            const result = parseDateFromText(text, config);
            // Parser may return result but with invalid date
            if (result) {
                expect(result.date).toMatch(/^\d{4}-00-00$/);
            }
        });
    });
});

describe('Integration tests', () => {
    test('complete workflow: parse date, calculate diff, format, get color', () => {
        const referenceDate = new Date(2026, 2, 1); // March 1, 2026

        // Parse a future date
        const dateStr = '2026-03-08';
        const parsedDate = parseDate(dateStr);
        expect(parsedDate).not.toBeNull();

        // Calculate difference
        const diff = getDaysDiff(parsedDate, referenceDate);
        expect(diff).toBe(7);

        // Format the text
        const text = formatDaysText(diff);
        expect(text).toBe('7日後');

        // Get color
        const color = getDaysColor(diff);
        expect(color).toBe('#246fe0'); // Blue (within 1 week)
    });

    test('complete workflow: parse from text, calculate diff, format in English', () => {
        const config = { language: 'en', format: 'after' };
        const referenceDate = new Date(2026, 2, 1); // March 1, 2026

        // Parse from text
        const textContent = 'Review PR - Due Mar 5';
        const dateInfo = parseDateFromText(textContent, config);
        expect(dateInfo).not.toBeNull();

        // Parse the date string
        const parsedDate = parseDate(dateInfo.date);
        expect(parsedDate).not.toBeNull();

        // Calculate difference
        const diff = getDaysDiff(parsedDate, referenceDate);
        expect(diff).toBe(4);

        // Format the text
        const text = formatDaysText(diff, config);
        expect(text).toBe('4d left');

        // Get color
        const color = getDaysColor(diff);
        expect(color).toBe('#246fe0'); // Blue
    });

    test('overdue task workflow', () => {
        const referenceDate = new Date(2026, 2, 10); // March 10, 2026

        const dateStr = '2026-03-05';
        const parsedDate = parseDate(dateStr);
        const diff = getDaysDiff(parsedDate, referenceDate);
        const text = formatDaysText(diff);
        const color = getDaysColor(diff);

        expect(diff).toBe(-5);
        expect(text).toBe('5日前');
        expect(color).toBe('#d1453b'); // Red
    });
});
