# claude-code-runnable

> 让还原的 Claude Code TypeScript 源码真正跑起来的工程化方案

本项目是一个**学习性工具链**，目标是在 Node.js 环境中运行由 source map 还原的 Claude Code 源码，方便开发者边运行边阅读，深入理解其架构设计。

---

## 背景

[ChinaSiro/claude-code-sourcemap](https://github.com/ChinaSiro/claude-code-sourcemap) 通过解析 `@anthropic-ai/claude-code` npm 包内附带的 `cli.js.map`，还原出了约 4,756 个 TypeScript 源文件。

但还原出的源码**无法直接运行**，原因在于：
- 构建工具是 Bun（非 Node.js），使用了 `bun:bundle`、`bun:ffi` 等专有 API
- 依赖大量 Anthropic 内部私有包（`@ant/*`、`@anthropic-ai/sandbox-runtime` 等）
- 引用了多个未还原的内部文件
- 使用了 React 19 的新 API（`useEffectEvent`）

**本项目解决了上述所有问题**，让源码可以在标准 Node.js 18+ 环境中启动运行。

---

## 工具链说明

| 文件 | 作用 |
|------|------|
| `bun-loader.mjs` | ESM 自定义 loader，拦截 `bun:bundle`/`bun:ffi` 协议 |
| `bun-mock.mjs` | Bun 专属 API 的 Node.js 运行时 mock |
| `scripts/gen-pkg-stubs.mjs` | 扫描源码，自动为 Anthropic 私有包生成 stub |
| `scripts/gen-file-stubs.mjs` | 扫描源码，为未还原的内部文件生成 stub |
| `scripts/gen-stubs.mjs` | 批量生成缺失的内部 `.ts` stub 文件 |
| `types/bun-stubs.d.ts` | Bun 专属模块的 TypeScript 类型声明 |
| `types/internal-stubs.d.ts` | Anthropic 内部包的 TypeScript 类型声明 |
| `tsconfig.json` | 适配还原源码的 TypeScript 编译配置 |
| `package.json` | 完整依赖声明（含所有可公开安装的依赖） |

---

## 快速开始

### 1. 获取还原的源码

```bash
git clone https://github.com/ChinaSiro/claude-code-sourcemap.git
cd claude-code-sourcemap/restored-src
```

### 2. 复制本项目的工具链文件

将本仓库的所有文件覆盖到 `restored-src/` 目录中。

### 3. 安装依赖

```bash
npm install
# postinstall 会自动运行 gen-pkg-stubs.mjs 生成私有包 stub
```

### 4. 生成内部文件 stub

```bash
node scripts/gen-stubs.mjs
node scripts/gen-file-stubs.mjs
```

### 5. 运行

```bash
NODE_OPTIONS="--experimental-loader ./bun-loader.mjs" npx tsx src/main.tsx
NODE_OPTIONS="--experimental-loader ./bun-loader.mjs" npx tsx src/main.tsx --help
```

---

## 解决的核心技术问题

### 问题 1：`bun:bundle` 运行时错误

Bun 的编译期 API 在 Node.js 中无法加载。通过自定义 ESM loader 拦截 `bun:` 协议，重定向到 mock 实现。

```js
// bun-loader.mjs
export function resolve(specifier, context, nextResolve) {
  if (specifier === 'bun:bundle' || specifier === 'bun:ffi') {
    return { shortCircuit: true, url: bunMockUrl };
  }
  return nextResolve(specifier, context);
}
```

### 问题 2：Anthropic 私有包

通过脚本扫描所有 `import` 语句，找出每个私有包被使用的具名导出，自动生成对应的 stub 包到 `node_modules/`。

### 问题 3：未还原的内部文件

source map 未能还原约 154 个内部文件。通过脚本分析谁引用了这些文件、需要哪些导出，自动生成最小化 stub。

### 问题 4：React 19 API

`react-reconciler@0.33` 需要 React 19。升级 React 至 19.x 后，`useEffectEvent` 等新 API 原生支持。

---

## 架构速览

```
restored-src/src/
├── main.tsx              # CLI 入口
├── tools/                # 工具实现（Bash、FileEdit、Grep 等）
├── commands/             # 命令实现（commit、review、config 等）
├── services/             # API、MCP 服务
├── coordinator/          # 多 Agent 协调 ⭐
├── context/              # React Context 状态管理
├── assistant/            # 助手模式（内部代号 KAIROS）
├── plugins/              # 插件系统
├── skills/               # Skills 系统
└── utils/                # 工具函数
```

**关键架构特点：**
- 使用 React + [Ink](https://github.com/vadimdemedes/ink) 渲染终端 UI（不是传统 CLI）
- 工具调用通过统一接口抽象，LLM 通过 `tool_use` 调用
- `coordinator/` 实现了子 Agent 的派发与结果聚合
- 基于 Bun 构建，源码中大量使用 `MACRO` 做编译期常量注入

---

## 声明

- 本仓库**不包含** Claude Code 的还原源码，仅包含工程化工具链
- Claude Code 源码版权归 **Anthropic** 所有
- 还原源码来自 [ChinaSiro/claude-code-sourcemap](https://github.com/ChinaSiro/claude-code-sourcemap)，后者基于 npm 包中公开附带的 source map 文件提取
- 本项目仅供技术学习研究，**禁止商业使用**

---

## License

MIT（仅限本仓库的工具链代码）
