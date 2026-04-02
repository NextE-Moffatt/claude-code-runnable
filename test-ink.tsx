// Minimal test: does the custom Ink render anything?
import React from 'react';
import { createRoot } from './src/ink/root.js';
import Text from './src/ink/components/Text.js';
import Box from './src/ink/components/Box.js';

async function main() {
  process.stderr.write('[test] creating root...\n');
  const root = await createRoot({ exitOnCtrlC: true });
  process.stderr.write('[test] root created, rendering...\n');
  root.render(
    React.createElement(Box, { flexDirection: 'column' },
      React.createElement(Text, { bold: true }, '=== Ink render test ==='),
      React.createElement(Text, null, 'If you see this, Ink is working!'),
      React.createElement(Text, { dimColor: true }, 'Press Ctrl+C to exit'),
    )
  );
  process.stderr.write('[test] render() called\n');
  await root.waitUntilExit();
}

main().catch(err => {
  process.stderr.write('[test] ERROR: ' + err.stack + '\n');
  process.exit(1);
});
