# Todoist Days To Go

A userscript that displays days remaining until due/deadline in the Todoist task list.

English | [日本語](README.ja.md) | [中文](README.zh.md)

![Screenshot](screenshot.png)

## Features

- Displays "Xd ago", "in Xd", etc. next to the date display in task rows
- **Persistent display**: Badges remain visible regardless of mouse hover state
- Color-coded based on remaining days:
  - 🔴 Overdue/Today: Red
  - 🟠 Within 3 days: Orange
  - 🔵 Within 1 week: Blue
  - ⚫ Beyond 1 week: Gray
- **Multi-language support**: Japanese, English, and Chinese
- **Accurate calculations**: Uses proper rounding for precise day counts

## Installation

### 1. Install Tampermonkey

Install [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) from the Chrome Web Store.

### 2. Install the userscript

Choose one of the following methods:

#### Method A: Direct Install

1. Open [todoist-days-to-go.user.js](./todoist-days-to-go.user.js)
2. Click the "Raw" button
3. Tampermonkey will prompt you to install - click "Install"

#### Method B: Manual Install

1. Open the Tampermonkey dashboard (toolbar icon → Dashboard)
2. Click the "+" tab to create a new script
3. Copy and paste the contents of [todoist-days-to-go.user.js](./todoist-days-to-go.user.js)
4. Save with Ctrl+S (Cmd+S on Mac)

## Usage

After installation, the script runs automatically when you open Todoist.

## Configuration

Edit the `CONFIG` object at the top of the script to customize:

```javascript
const CONFIG = {
    // Language: 'ja' (Japanese), 'en' (English), or 'zh' (Chinese)
    language: 'ja',
    // Display format: 'before', 'after', or 'D-'
    format: 'before',
    // Update interval (milliseconds)
    updateInterval: 1000,
    // Debug mode (outputs logs to console)
    debug: false
};
```

### Language Options

| language | Example displays |
|----------|------------------|
| `'ja'` | 3日前, 今日, 3日後 |
| `'en'` | 3d ago, Today, in 3d |
| `'zh'` | 3天前, 今天, 3天后 |

### Display Format Options

| format | Past | Today | Future (ja) | Future (en) |
|--------|------|-------|-------------|-------------|
| `'before'` | 3日前 / 3d ago | 今日 / Today | 3日後 / in 3d |
| `'after'` | 3日前 / 3d ago | 今日 / Today | あと3日 / 3d left |
| `'D-'` | 3日前 / 3d ago | 今日 / Today | D-3 |

## Troubleshooting

### Badge not showing

1. Verify Tampermonkey is enabled
2. Check that the script is enabled for todoist.com (Tampermonkey icon → check the script)
3. Reload the page
4. Set `CONFIG.debug = true` and check console logs

### Script stops working after Todoist update

Todoist's DOM structure may have changed. Please open an issue and I'll update the script.

## How It Works

1. MutationObserver monitors DOM changes in real-time
2. Extracts date information from task elements using multiple fallback methods
3. Calculates days difference from today using accurate rounding (Math.round)
4. Inserts a persistent badge next to the date element using insertAdjacentElement
5. Badge visibility is maintained regardless of hover state through CSS positioning

## Development

### Running Tests

This project includes a comprehensive test suite with 100% code coverage.

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Coverage

- **Statements**: 100% (72/72)
- **Branches**: 93.18% (41/44)
- **Functions**: 100% (22/22)
- **Lines**: 100% (71/71)

The test suite includes 73 comprehensive tests covering:
- All language formats (Japanese, English, Chinese)
- Date parsing and calculations
- Color logic
- Text formatting
- Edge cases and error handling

## Recent Updates

### Version 1.1.2
- Fixed badge disappearing on mouse hover
- Improved element targeting for persistent display
- Enhanced CSS with !important flags for visibility

### Version 1.1.1
- Fixed incorrect day calculation (changed from Math.ceil to Math.round)
- More accurate "days to go" counting

### Version 1.1.0
- Added comprehensive test suite
- Improved code quality and reliability

## License

MIT License

## Contributing

Issues and Pull Requests are welcome! Please ensure tests pass before submitting PRs.

### Running Tests Before Contributing

```bash
npm install
npm test
```