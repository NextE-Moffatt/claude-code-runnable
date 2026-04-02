import { MACRO } from 'src/bun-bundle-shim.ts'
import React from 'react'
import { Box, Text } from 'src/ink.js'

// 超级赛亚人 ASCII 艺术
const SSJ_ART = [
  '          ⚡  \\  |  /  ⚡         ',
  '        ⚡  \\ \\|/ / ⚡           ',
  '     ___/|\\___/\\___/|\\___        ',
  '    /  / | \\  /\\  / | \\  \\      ',
  '   / /   |  \\/  \\/  |   \\ \\     ',
  '  /_/ ╔══╧══════════╧══╗ \\_\\    ',
  '      ║  ◉          ◉  ║        ',
  '      ║      ____       ║        ',
  '      ║     /    \\      ║        ',
  '      ║     \\____/      ║        ',
  '   ╔══╩════════════════╩══╗      ',
  '   ║    ████████████████   ║      ',
  '   ╚═══════════════════════╝      ',
  '      ⚡ ⚡ ⚡ ⚡ ⚡ ⚡ ⚡         ',
]

// 闪电边框装饰
const THUNDER = '⚡━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━⚡'

export function WelcomeV2() {
  return (
    <Box flexDirection="column" width={60}>
      {/* 顶部闪电分割线 */}
      <Text color="yellow">{THUNDER}</Text>

      {/* 标题 */}
      <Box justifyContent="center" marginTop={1}>
        <Text bold color="yellow">
          ⚡ 超级赛亚人 CLAUDE CODE ⚡
        </Text>
      </Box>
      <Box justifyContent="center">
        <Text color="yellowBright">
          {'★ '}
        </Text>
        <Text bold color="white">
          POWER LEVEL:{' '}
        </Text>
        <Text bold color="red">
          OVER 9000!!!
        </Text>
        <Text color="yellowBright">
          {' ★'}
        </Text>
      </Box>

      {/* 版本号 */}
      <Box justifyContent="center" marginBottom={1}>
        <Text dimColor>v{MACRO.VERSION}</Text>
      </Box>

      {/* ASCII 超级赛亚人 */}
      {SSJ_ART.map((line, i) => (
        <Box key={i} justifyContent="center">
          <Text color={i < 5 ? 'yellowBright' : i < 10 ? 'yellow' : 'white'}>
            {line}
          </Text>
        </Box>
      ))}

      {/* 战斗力提示 */}
      <Box justifyContent="center" marginTop={1}>
        <Text color="cyan">〔 </Text>
        <Text bold color="white">战斗力全开！准备好接受 AI 的洗礼了吗？</Text>
        <Text color="cyan"> 〕</Text>
      </Box>

      {/* 底部闪电分割线 */}
      <Text color="yellow">{THUNDER}</Text>
    </Box>
  )
}

// 简单终端兼容版本（Apple Terminal 等）
export function AppleTerminalWelcomeV2({
  theme,
  welcomeMessage,
}: {
  theme: string
  welcomeMessage: string
}) {
  return (
    <Box flexDirection="column">
      <Text bold color="yellow">⚡ {welcomeMessage} ⚡</Text>
      <Text color="yellow">POWER LEVEL: OVER 9000!!!</Text>
      <Text dimColor>v{MACRO.VERSION}</Text>
    </Box>
  )
}
