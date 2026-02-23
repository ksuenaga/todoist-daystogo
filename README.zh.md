# Todoist Days To Go

一个在 Todoist 任务列表中显示距离截止日期/到期日剩余天数的用户脚本。

[English](README.md) | [日本語](README.ja.md) | 中文

![截图](screenshot.png)

## 功能

- 在任务行的日期显示旁边显示"X天前"、"X天后"等
- **持久显示**：无论鼠标悬停状态如何，徽章始终可见
- 根据剩余天数进行颜色编码：
  - 🔴 已过期/今天：红色
  - 🟠 3天内：橙色
  - 🔵 1周内：蓝色
  - ⚫ 1周以上：灰色
- **多语言支持**：日语、英语、中文
- **精确计算**：使用适当的四舍五入实现精确的天数计算

## 安装

### 1. 安装 Tampermonkey

从 Chrome 网上应用店安装 [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)。

### 2. 安装用户脚本

选择以下任一方法：

#### 方法A：直接安装

1. 打开 [todoist-days-to-go.user.js](./todoist-days-to-go.user.js)
2. 点击"Raw"按钮
3. Tampermonkey 会提示安装 - 点击"安装"

#### 方法B：手动安装

1. 打开 Tampermonkey 管理面板（工具栏图标 → 管理面板）
2. 点击"+"标签创建新脚本
3. 复制并粘贴 [todoist-days-to-go.user.js](./todoist-days-to-go.user.js) 的内容
4. 使用 Ctrl+S（Mac 上为 Cmd+S）保存

## 使用方法

安装后，打开 Todoist 时脚本会自动运行。

## 配置

编辑脚本顶部的 `CONFIG` 对象进行自定义：

```javascript
const CONFIG = {
    // 语言：'ja'（日语）、'en'（英语）或 'zh'（中文）
    language: 'zh',
    // 显示格式：'before'、'after' 或 'D-'
    format: 'before',
    // 更新间隔（毫秒）
    updateInterval: 1000,
    // 调试模式（在控制台输出日志）
    debug: false
};
```

### 语言选项

| language | 显示示例 |
|----------|----------|
| `'ja'` | 3日前、今日、3日後 |
| `'en'` | 3d ago、Today、in 3d |
| `'zh'` | 3天前、今天、3天后 |

### 显示格式选项

| format | 过去 | 今天 | 未来 |
|--------|------|------|------|
| `'before'` | 3天前 | 今天 | 3天后 |
| `'after'` | 3天前 | 今天 | 还剩3天 |
| `'D-'` | 3天前 | 今天 | D-3 |

## 故障排除

### 徽章不显示

1. 确认 Tampermonkey 已启用
2. 检查脚本是否对 todoist.com 启用（Tampermonkey 图标 → 勾选该脚本）
3. 刷新页面
4. 设置 `CONFIG.debug = true` 并查看控制台日志

### Todoist 更新后脚本停止工作

Todoist 的 DOM 结构可能已更改。请提交 issue，我会更新脚本。

## 工作原理

1. MutationObserver 实时监控 DOM 变化
2. 使用多种后备方法从任务元素中提取日期信息
3. 使用精确的四舍五入（Math.round）计算与今天的天数差
4. 使用 insertAdjacentElement 在日期元素旁边插入持久徽章
5. 通过 CSS 定位保持徽章可见性，无论悬停状态如何

## 开发

### 运行测试

该项目包含具有 100% 代码覆盖率的综合测试套件。

```bash
# 安装依赖
npm install

# 运行测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 在监视模式下运行测试
npm run test:watch
```

### 测试覆盖率

- **语句**: 100% (72/72)
- **分支**: 93.18% (41/44)
- **函数**: 100% (22/22)
- **行**: 100% (71/71)

测试套件包含 73 个综合测试，涵盖：
- 所有语言格式（日语、英语、中文）
- 日期解析和计算
- 颜色逻辑
- 文本格式化
- 边缘情况和错误处理

## 最近更新

### 版本 1.1.2
- 修复鼠标悬停时徽章消失的问题
- 改进元素定位以实现持久显示
- 为可见性添加了带 !important 标志的 CSS

### 版本 1.1.1
- 修复不正确的天数计算（从 Math.ceil 改为 Math.round）
- 更准确的"剩余天数"计数

### 版本 1.1.0
- 添加了综合测试套件
- 提高了代码质量和可靠性

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！提交 PR 前请确保测试通过。

### 贡献前运行测试

```bash
npm install
npm test
```