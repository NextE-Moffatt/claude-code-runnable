import * as React from 'react'
import { Box, Text } from '../../ink.js'

export type ClawdPose = 'default' | 'arms-up' | 'look-left' | 'look-right'

type Props = {
  pose?: ClawdPose
}

// 超级赛亚人 ASCII 艺术
// 9列宽，与原版 Clawd 保持相同尺寸
const SSJ_LINES = [
  { text: ' \\|/ ',  color: 'yellowBright' as const },  // 发光光芒
  { text: '/|||\\ ', color: 'yellow'      as const },  // 尖刺头发
  { text: '▐◉_◉▌', color: 'yellowBright' as const },  // 发光眼睛
  { text: '▐▄▄▄▌', color: 'yellow'      as const },  // 嘴巴
  { text: '⚡   ⚡', color: 'yellowBright' as const },  // 闪电
]

const SSJ_ARMS_UP = [
  { text: '\\|I|/', color: 'yellowBright' as const },
  { text: '-|||_', color: 'yellow'      as const },
  { text: '▐◉ ◉▌', color: 'yellowBright' as const },
  { text: '▐▄▄▄▌', color: 'yellow'      as const },
  { text: '⚡ ⚡ ', color: 'yellowBright' as const },
]

export function Clawd({ pose = 'default' }: Props) {
  const lines = pose === 'arms-up' ? SSJ_ARMS_UP : SSJ_LINES

  return (
    <Box flexDirection="column" alignItems="center">
      {lines.map((line, i) => (
        <Text key={i} color={line.color} bold>
          {line.text}
        </Text>
      ))}
    </Box>
  )
}

// Apple Terminal 简化版
export function AppleTerminalClawd({ pose }: { pose: ClawdPose }) {
  return (
    <Box flexDirection="column" alignItems="center">
      <Text color="yellow" bold>{'\\|/'}</Text>
      <Text color="yellow" bold>{'◉ ◉'}</Text>
      <Text color="yellow" bold>{'⚡⚡'}</Text>
    </Box>
  )
}
