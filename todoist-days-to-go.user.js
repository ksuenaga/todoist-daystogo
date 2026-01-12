// ==UserScript==
// @name         Todoist Days To Go
// @namespace    https://github.com/kohei-todoist-days-to-go
// @version      1.0.0
// @description  Todoistのタスク一覧に締切/期日までの残り日数「○日前」を表示
// @author       Kohei
// @match        https://todoist.com/*
// @match        https://app.todoist.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // 設定
    const CONFIG = {
        // 表示形式: 'before' = "○日前", 'after' = "あと○日", 'D-' = "D-○"
        format: 'before',
        // 更新間隔（ミリ秒）
        updateInterval: 1000,
        // デバッグモード
        debug: false
    };

    // ログ関数
    function log(...args) {
        if (CONFIG.debug) {
            console.log('[Todoist Days To Go]', ...args);
        }
    }

    // 今日の日付（時刻なし）を取得
    function getToday() {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    // 日付文字列をパース（YYYY-MM-DD形式）
    function parseDate(dateStr) {
        if (!dateStr) return null;
        const match = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
        if (match) {
            return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
        }
        return null;
    }

    // 日数差を計算
    function getDaysDiff(targetDate) {
        const today = getToday();
        const diffTime = targetDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    // 残り日数の表示テキストを生成
    function formatDaysText(days) {
        if (days === 0) {
            return '今日';
        } else if (days === 1) {
            return '明日';
        } else if (days === -1) {
            return '昨日';
        } else if (days < 0) {
            // 過去の日付
            return `${Math.abs(days)}日前`;
        } else {
            // 未来の日付
            switch (CONFIG.format) {
                case 'before':
                    return `${days}日後`;
                case 'after':
                    return `あと${days}日`;
                case 'D-':
                    return `D-${days}`;
                default:
                    return `${days}日後`;
            }
        }
    }

    // 日数に応じた色を取得
    function getDaysColor(days) {
        if (days < 0) {
            return '#d1453b'; // 過去（赤）
        } else if (days === 0) {
            return '#d1453b'; // 今日（赤）
        } else if (days <= 3) {
            return '#eb8909'; // 3日以内（オレンジ）
        } else if (days <= 7) {
            return '#246fe0'; // 1週間以内（青）
        } else {
            return '#808080'; // それ以上（グレー）
        }
    }

    // バッジ要素を作成
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
        `;
        return badge;
    }

    // タスク行の日付情報から期日を抽出
    // deadline（📆）を優先し、なければdue date（📅）を使用
    function extractDateFromTask(taskElement) {
        const taskRow = taskElement.closest('[data-item-id]') || taskElement;
        
        // 方法1: data属性から直接取得を試みる
        const dateChip = taskRow.querySelector('[data-due-date]');
        if (dateChip) {
            return { date: dateChip.getAttribute('data-due-date'), type: 'due' };
        }

        // 方法2: datetime属性を持つ要素を探す
        const dateElements = taskRow.querySelectorAll('time, [datetime]');
        for (const el of dateElements) {
            const datetime = el.getAttribute('datetime');
            if (datetime) {
                return { date: datetime, type: 'datetime' };
            }
        }

        // 方法3: テキストから日付をパース（日本語形式）
        // スクショ: "📅今日 📆1月21日" のような形式
        // deadlineアイコン（📆）の後の日付を優先
        const textContent = taskRow.textContent;
        
        // deadlineの日付を探す（📆の後の日付）
        // 複数の日付がある場合、deadline（後ろ）を優先
        const allDateMatches = [...textContent.matchAll(/(\d{1,2})月(\d{1,2})日/g)];
        
        if (allDateMatches.length > 0) {
            // 最後の日付をdeadlineとみなす（スクショの形式に基づく）
            const match = allDateMatches[allDateMatches.length - 1];
            const month = parseInt(match[1]);
            const day = parseInt(match[2]);
            const year = new Date().getFullYear();
            
            // 過去の日付で6ヶ月以上前なら来年と判断
            const testDate = new Date(year, month - 1, day);
            const today = getToday();
            let finalYear = year;
            if (testDate < today && (today - testDate) > 180 * 24 * 60 * 60 * 1000) {
                finalYear = year + 1;
            }
            
            return {
                date: `${finalYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
                type: 'deadline'
            };
        }

        return null;
    }

    // 日付チップ要素を探す（バッジを追加する位置）
    function findDateChipContainer(taskElement) {
        // Todoistの日付表示部分を探す
        // 複数のセレクタを試す
        const selectors = [
            '.task_list_item__info_tags',  // タグ情報エリア
            '.due_date_controls',           // 期日コントロール
            '[data-testid="task-due-date"]', // テスト用属性
            '.scheduler-chip',              // スケジューラーチップ
        ];

        for (const selector of selectors) {
            const container = taskElement.querySelector(selector);
            if (container) {
                return container;
            }
        }

        // 日付テキストを含む要素を直接探す
        const allSpans = taskElement.querySelectorAll('span, div');
        for (const span of allSpans) {
            if (span.textContent.match(/\d{1,2}月\d{1,2}日|今日|明日|昨日/)) {
                return span.parentElement;
            }
        }

        return null;
    }

    // タスク要素を処理
    function processTask(taskElement) {
        // 既にバッジがあれば削除（更新のため）
        const existingBadge = taskElement.querySelector('.todoist-days-badge');
        if (existingBadge) {
            existingBadge.remove();
        }

        // 日付を抽出
        const dateInfo = extractDateFromTask(taskElement);
        if (!dateInfo) {
            log('日付が見つかりません:', taskElement);
            return;
        }

        const targetDate = parseDate(dateInfo.date);
        if (!targetDate) {
            log('日付のパースに失敗:', dateInfo.date);
            return;
        }

        // 日数差を計算
        const days = getDaysDiff(targetDate);
        log(`日付: ${dateInfo.date} (${dateInfo.type}), 残り日数: ${days}`);

        // バッジを追加
        const container = findDateChipContainer(taskElement);
        if (container) {
            const badge = createBadge(days);
            container.appendChild(badge);
            log('バッジを追加しました');
        } else {
            log('バッジの追加先が見つかりません');
        }
    }

    // 全タスクを処理
    function processAllTasks() {
        // タスクリストアイテムを取得
        const selectors = [
            '.task_list_item',
            '[data-item-id]',
            '.task_list_item__body',
        ];

        const processedTasks = new Set();

        for (const selector of selectors) {
            const tasks = document.querySelectorAll(selector);
            tasks.forEach(task => {
                // 重複処理を防ぐ
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
                    log('タスク処理エラー:', e);
                }
            });
        }
    }

    // DOM変更を監視
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
                // 少し遅延させて確実にDOMが安定してから処理
                setTimeout(processAllTasks, 100);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['data-item-id', 'class']
        });

        log('MutationObserver を設定しました');
    }

    // 初期化
    function init() {
        log('初期化開始');

        // スタイルを追加
        const style = document.createElement('style');
        style.textContent = `
            .todoist-days-badge {
                transition: opacity 0.2s ease;
            }
            .todoist-days-badge:hover {
                opacity: 0.8;
            }
        `;
        document.head.appendChild(style);

        // 初回処理
        setTimeout(processAllTasks, 1000);

        // DOM監視を開始
        setupObserver();

        // 定期的に更新（日付が変わった場合など）
        setInterval(processAllTasks, CONFIG.updateInterval * 60);

        log('初期化完了');
    }

    // ページ読み込み完了後に実行
    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }
})();
