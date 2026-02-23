// Testable module for Todoist Days To Go
// This file extracts the core logic from the userscript for testing purposes

// ===================
// Language definitions
// ===================
const LANGUAGES = {
    ja: {
        // Badge display formats
        today: '今日',
        tomorrow: '明日',
        yesterday: '昨日',
        daysAgo: (n) => `${n}日前`,
        daysLater: (n) => `${n}日後`,
        daysRemaining: (n) => `あと${n}日`,
        dMinus: (n) => `D-${n}`,
        // Date pattern for parsing (regex)
        datePattern: /(\d{1,2})月(\d{1,2})日/g,
        parseDateMatch: (match) => ({ month: parseInt(match[1]), day: parseInt(match[2]) }),
        // Date keywords for finding date containers
        dateKeywords: /\d{1,2}月\d{1,2}日|今日|明日|昨日/,
    },
    en: {
        // Badge display formats
        today: 'Today',
        tomorrow: 'Tomorrow',
        yesterday: 'Yesterday',
        daysAgo: (n) => `${n}d ago`,
        daysLater: (n) => `in ${n}d`,
        daysRemaining: (n) => `${n}d left`,
        dMinus: (n) => `D-${n}`,
        // Date pattern for parsing (regex) - matches "Jan 21", "January 21", "21 Jan", etc.
        datePattern: /(?:(\d{1,2})\s+)?(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*(?:\s+(\d{1,2}))?/gi,
        parseDateMatch: (match) => {
            const months = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
            const monthStr = match[2].toLowerCase().slice(0, 3);
            const day = parseInt(match[1] || match[3]);
            return { month: months[monthStr], day: day };
        },
        // Date keywords for finding date containers
        dateKeywords: /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}\b|\bToday\b|\bTomorrow\b|\bYesterday\b/i,
    },
    zh: {
        // Badge display formats
        today: '今天',
        tomorrow: '明天',
        yesterday: '昨天',
        daysAgo: (n) => `${n}天前`,
        daysLater: (n) => `${n}天后`,
        daysRemaining: (n) => `还剩${n}天`,
        dMinus: (n) => `D-${n}`,
        // Date pattern for parsing (regex) - matches "1月21日" format
        datePattern: /(\d{1,2})月(\d{1,2})日/g,
        parseDateMatch: (match) => ({ month: parseInt(match[1]), day: parseInt(match[2]) }),
        // Date keywords for finding date containers
        dateKeywords: /\d{1,2}月\d{1,2}日|今天|明天|昨天/,
    }
};

// ===================
// Configuration
// ===================
const DEFAULT_CONFIG = {
    // Language: 'ja' (Japanese), 'en' (English), or 'zh' (Chinese)
    language: 'ja',
    // Display format: 'before' = "Xd ago/later", 'after' = "X days left", 'D-' = "D-X"
    format: 'before',
    // Update interval (milliseconds)
    updateInterval: 1000,
    // Debug mode
    debug: false
};

// Get language settings
function getLang(config = DEFAULT_CONFIG) {
    return LANGUAGES[config.language] || LANGUAGES.ja;
}

// Get today's date (without time)
function getToday() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

// Parse date string (YYYY-MM-DD format)
function parseDate(dateStr) {
    if (!dateStr) return null;
    const match = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
        return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
    }
    return null;
}

// Calculate difference in days
function getDaysDiff(targetDate, referenceDate = null) {
    const today = referenceDate || getToday();
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

// Generate display text for remaining days
function formatDaysText(days, config = DEFAULT_CONFIG) {
    const lang = getLang(config);

    if (days === 0) {
        return lang.today;
    } else if (days === 1) {
        return lang.tomorrow;
    } else if (days === -1) {
        return lang.yesterday;
    } else if (days < 0) {
        // Past date
        return lang.daysAgo(Math.abs(days));
    } else {
        // Future date
        switch (config.format) {
            case 'before':
                return lang.daysLater(days);
            case 'after':
                return lang.daysRemaining(days);
            case 'D-':
                return lang.dMinus(days);
            default:
                return lang.daysLater(days);
        }
    }
}

// Get color based on remaining days
function getDaysColor(days) {
    if (days < 0) {
        return '#d1453b'; // Overdue (red)
    } else if (days === 0) {
        return '#d1453b'; // Today (red)
    } else if (days <= 3) {
        return '#eb8909'; // Within 3 days (orange)
    } else if (days <= 7) {
        return '#246fe0'; // Within 1 week (blue)
    } else {
        return '#808080'; // Beyond 1 week (gray)
    }
}

// Parse date from text content (language-specific)
function parseDateFromText(textContent, config = DEFAULT_CONFIG) {
    const lang = getLang(config);

    // Find all date matches using language-specific pattern
    const allDateMatches = [...textContent.matchAll(lang.datePattern)];

    if (allDateMatches.length > 0) {
        // Use the last date as deadline (based on Todoist UI layout)
        const match = allDateMatches[allDateMatches.length - 1];
        const parsed = lang.parseDateMatch(match);

        if (!parsed.month || !parsed.day) {
            return null;
        }

        const year = new Date().getFullYear();

        // If the date is more than 6 months in the past, assume next year
        const testDate = new Date(year, parsed.month - 1, parsed.day);
        const today = getToday();
        let finalYear = year;
        if (testDate < today && (today - testDate) > 180 * 24 * 60 * 60 * 1000) {
            finalYear = year + 1;
        }

        return {
            date: `${finalYear}-${String(parsed.month).padStart(2, '0')}-${String(parsed.day).padStart(2, '0')}`,
            type: 'deadline'
        };
    }

    return null;
}

// Module exports for testing
module.exports = {
    LANGUAGES,
    DEFAULT_CONFIG,
    getLang,
    getToday,
    parseDate,
    getDaysDiff,
    formatDaysText,
    getDaysColor,
    parseDateFromText
};
