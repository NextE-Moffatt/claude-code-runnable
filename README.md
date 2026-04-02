# claude-code-runnable

> 逆向还原 Claude Code TypeScript 源码，用 Bun 原生跑起来 ⚡

本项目是一个**学习性工程**，目标是在 Bun 运行时中直接运行由 source map 还原的 Claude Code 源码，方便开发者边运行边阅读，深入理解其架构设计。

---

## 背景

[ChinaSiro/claude-code-sourcemap](https://github.com/ChinaSiro/claude-code-sourcemap) 通过解析 `@anthropic-ai/claude-code` npm 包内附带的 `cli.js.map`，还原出了约 4,756 个 TypeScript 源文件。

但还原出的源码**无法直接运行**，原因在于：

- 构建工具是 Bun，使用了 `bun:bundle`（编译期宏）等专有 API
- 依赖大量 Anthropic 内部私有包（`@ant/*`、`@anthropic-ai/sandbox-runtime` 等）
- 引用了多个未还原的内部文件
- 使用了 React 19 的新 API（`useEffectEvent`）

**本项目解决了上述所有问题**，让源码可以在 Bun 运行时中直接启动运行。

---

## 快速开始

### 环境要求

- [Bun](https://bun.sh) >= 1.0（推荐 1.3+）

### 安装运行

```bash
git clone https://github.com/NextE-Moffatt/claude-code-runnable.git
cd claude-code-runnable/restored-src

bun install
./run.sh          # 启动交互式 TUI
./run.sh --help   # 查看帮助
./run.sh --version
```

或者直接：

```bash
bun --preload ./bun-preload.ts src/entrypoints/cli.tsx
```

---

## 核心技术问题与解法

### 问题 1：`bun:bundle` 编译期宏在运行时不可用

`bun:bundle` 是 Bun 打包器的编译期专属模块，运行时虽存在但不导出 `MACRO`（那是打包时注入的常量）。即使写 Bun 插件也无法覆盖 `bun:` 前缀的内置模块。

**解法：** 创建 `src/bun-bundle-shim.ts`，提供 `MACRO` 和 `feature()` 的运行时实现；用 `sed` 批量将 233 个源文件的 `from 'bun:bundle'` 替换为 `from 'src/bun-bundle-shim.ts'`，利用 tsconfig `baseUrl` 保证路径在任意子目录中统一可解析。

```typescript
// src/bun-bundle-shim.ts
export const MACRO = (globalThis as any).MACRO ?? {
  VERSION: '2.1.88',
  ISSUES_EXPLAINER: 'report the issue at https://github.com/anthropics/claude-code/issues',
  VERSION_CHANGELOG: '',
}
export function feature(_name: string): boolean { return false }
```

### 问题 2：Anthropic 私有包

通过脚本扫描所有 `import` 语句，找出每个私有包被使用的具名导出，自动生成对应的 stub 包到 `node_modules/`。

### 问题 3：未还原的内部文件

source map 未能还原约 154 个内部文件。通过脚本分析引用关系，自动生成最小化 stub。

### 问题 4：运行时 API 兼容性

- `headers.forEach` 类型不兼容：加 `typeof` 检测后回退到 `Object.keys()`
- `error.headers?.get()` 可能不是函数：改用双重可选链 `?.get?.()`
- `isSupportedPlatform()` 在 React 渲染中抛错：包一层 try/catch 返回 `false`

---

## DIY 主题：超级赛亚人风格 ⚡

本仓库还顺手把欢迎界面改成了超级赛亚人配色，作为"可以随意改源码"的一个示范：

| 文件 | 改动 |
|------|------|
| `src/components/LogoV2/Clawd.tsx` | 把吉祥物换成黄金色 ASCII 战士 + 闪电 |
| `src/components/LogoV2/LogoV2.tsx` | 边框颜色改为黄色，标题加上 ⚡ |
| `src/utils/logoV2Utils.ts` | 欢迎语改为"战斗力暴增！" |

---

## 工具链文件说明

| 文件 | 作用 |
|------|------|
| `bun-preload.ts` | Bun preload：在主线程中预设 `globalThis.MACRO` |
| `src/bun-bundle-shim.ts` | `bun:bundle` 的运行时 shim，提供 MACRO 和 feature() |
| `run.sh` | 一键启动脚本 |
| `tsconfig.json` | 含 `baseUrl: "."` 以支持 `src/` 前缀绝对路径 |

---

## 架构速览

```
src/
├── entrypoints/cli.tsx   # CLI 入口
├── tools/                # 工具实现（Bash、FileEdit、Grep 等）
├── commands/             # 命令实现（commit、review、config 等）
├── services/             # API、MCP 服务
├── coordinator/          # 多 Agent 协调 ⭐
├── context/              # React Context 状态管理
├── components/LogoV2/    # 终端 TUI 欢迎界面
├── plugins/              # 插件系统
├── skills/               # Skills 系统
└── utils/                # 工具函数
```

**关键架构特点：**
- 使用 React + [Ink](https://github.com/vadimdemedes/ink) 渲染终端 UI（不是传统 CLI 输出）
- 工具调用通过统一接口抽象，LLM 通过 `tool_use` 调度
- `coordinator/` 实现子 Agent 的派发与结果聚合
- 大量使用 `MACRO` 做编译期常量注入（VERSION、ISSUES_EXPLAINER 等）

---

## 声明

- 本仓库**不包含** Claude Code 的还原源码，仅包含工程化工具链
- Claude Code 源码版权归 **Anthropic** 所有
- 还原源码来自 [ChinaSiro/claude-code-sourcemap](https://github.com/ChinaSiro/claude-code-sourcemap)，基于 npm 包中公开附带的 source map 文件提取
- 本项目仅供技术学习研究，**禁止商业使用**

---

## License

MIT（仅限本仓库的工具链代码）
