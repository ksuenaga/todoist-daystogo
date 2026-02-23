// ==UserScript==
// @name         Todoist Days To Go
// @namespace    https://github.com/kohei-todoist-days-to-go
// @version      1.1.2
// @description  Display days remaining until due/deadline in Todoist task list
// @author       Kohei
// @match        https://todoist.com/*
// @match        https://app.todoist.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

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
    const CONFIG = {
        // Language: 'ja' (Japanese), 'en' (English), or 'zh' (Chinese)
        language: 'ja',
        // Display format: 'before' = "Xd ago/later", 'after' = "X days left", 'D-' = "D-X"
        format: 'before',
        // Update interval (milliseconds)
        updateInterval: 1000,
        // Debug mode
        debug: false
    };

    // Get current language settings
    function getLang() {
        return LANGUAGES[CONFIG.language] || LANGUAGES.ja;
    }

    // Logging function
    function log(...args) {
        if (CONFIG.debug) {
            console.log('[Todoist Days To Go]', ...args);
        }
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
    function getDaysDiff(targetDate) {
        const today = getToday();
        const diffTime = targetDate.getTime() - today.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    // Generate display text for remaining days
    function formatDaysText(days) {
        const lang = getLang();
        
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
            switch (CONFIG.format) {
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

    // Create badge element
    function createBadge(days) {
        const badge = document.createElement('span');
        badge.className = 'todoist-days-badge';
        badge.textContent = formatDaysText(days);
        badge.style.cssText = `
            margin-left: 6px;
            padding: 1px 6px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 500;
            color: ${getDaysColor(days)};
            background-color: ${getDaysColor(days)}15;
            white-space: nowrap;
            pointer-events: none;
            display: inline-block;
            vertical-align: middle;
        `;
        return badge;
    }

    // Extract date from task row
    // Prioritizes deadline (📆), falls back to due date (📅)
    function extractDateFromTask(taskElement) {
        const taskRow = taskElement.closest('[data-item-id]') || taskElement;
        const lang = getLang();
        
        // Method 1: Try to get from data attribute
        const dateChip = taskRow.querySelector('[data-due-date]');
        if (dateChip) {
            return { date: dateChip.getAttribute('data-due-date'), type: 'due' };
        }

        // Method 2: Look for elements with datetime attribute
        const dateElements = taskRow.querySelectorAll('time, [datetime]');
        for (const el of dateElements) {
            const datetime = el.getAttribute('datetime');
            if (datetime) {
                return { date: datetime, type: 'datetime' };
            }
        }

        // Method 3: Parse date from text (language-specific format)
        const textContent = taskRow.textContent;
        
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

    // Find the date element (where to append the badge)
    function findDateElement(taskElement) {
        const lang = getLang();

        // Try to find the actual date display element (not hover-dependent containers)
        const selectors = [
            'button[data-testid="task-due-date"]',  // Date button
            '[data-testid="task-due-date"]',        // Date element
            'button.date',                           // Generic date button
            '.task_list_item__info_tags button',    // Button inside info tags
            '.scheduler-chip button',                // Button inside scheduler chip
            '[aria-label*="due"]',                   // Element with due in aria-label
        ];

        // Try selectors first
        for (const selector of selectors) {
            const element = taskElement.querySelector(selector);
            if (element) {
                return element;
            }
        }

        // Search for elements containing date text directly
        const allElements = taskElement.querySelectorAll('button, span, div');
        for (const element of allElements) {
            const text = element.textContent || '';
            if (text.match(lang.dateKeywords) && !element.classList.contains('todoist-days-badge')) {
                // Make sure it's a leaf element or has minimal children
                if (element.children.length <= 2) {
                    return element;
                }
            }
        }

        return null;
    }

    // Process a task element
    function processTask(taskElement) {
        // Remove existing badge (for update)
        const existingBadge = taskElement.querySelector('.todoist-days-badge');
        if (existingBadge) {
            existingBadge.remove();
        }

        // Extract date
        const dateInfo = extractDateFromTask(taskElement);
        if (!dateInfo) {
            log('Date not found:', taskElement);
            return;
        }

        const targetDate = parseDate(dateInfo.date);
        if (!targetDate) {
            log('Failed to parse date:', dateInfo.date);
            return;
        }

        // Calculate days difference
        const days = getDaysDiff(targetDate);
        log(`Date: ${dateInfo.date} (${dateInfo.type}), Days remaining: ${days}`);

        // Add badge next to the date element
        const dateElement = findDateElement(taskElement);
        if (dateElement) {
            const badge = createBadge(days);
            // Insert badge after the date element
            dateElement.insertAdjacentElement('afterend', badge);
            log('Badge added');
        } else {
            log('Date element not found');
        }
    }

    // Process all tasks
    function processAllTasks() {
        // Get task list items
        const selectors = [
            '.task_list_item',
            '[data-item-id]',
            '.task_list_item__body',
        ];

        const processedTasks = new Set();

        for (const selector of selectors) {
            const tasks = document.querySelectorAll(selector);
            tasks.forEach(task => {
                // Prevent duplicate processing
                const taskId = task.getAttribute('data-item-id') || 
                              task.closest('[data-item-id]')?.getAttribute('data-item-id');
                if (taskId && processedTasks.has(taskId)) {
                    return;
                }
                if (taskId) {
                    processedTasks.add(taskId);
                }

                try {
                    processTask(task);
                } catch (e) {
                    log('Task processing error:', e);
                }
            });
        }
    }

    // Observe DOM changes
    function setupObserver() {
        const observer = new MutationObserver((mutations) => {
            let shouldUpdate = false;
            for (const mutation of mutations) {
                if (mutation.addedNodes.length > 0 || 
                    mutation.type === 'attributes') {
                    shouldUpdate = true;
                    break;
                }
            }
            if (shouldUpdate) {
                // Delay slightly to ensure DOM has stabilized
                setTimeout(processAllTasks, 100);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['data-item-id', 'class']
        });

        log('MutationObserver initialized');
    }

    // Initialize
    function init() {
        log('Initialization started');

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .todoist-days-badge {
                transition: opacity 0.2s ease;
                visibility: visible !important;
                opacity: 1 !important;
                position: relative !important;
            }
            .todoist-days-badge:hover {
                opacity: 0.8 !important;
            }
        `;
        document.head.appendChild(style);

        // Initial processing
        setTimeout(processAllTasks, 1000);

        // Start DOM observation
        setupObserver();

        // Periodic update (e.g., when date changes)
        setInterval(processAllTasks, CONFIG.updateInterval * 60);

        log('Initialization complete');
    }

    // Execute after page load
    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }
})();