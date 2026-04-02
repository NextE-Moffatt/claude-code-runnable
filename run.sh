#!/usr/bin/env bash
# Run claude-code with Bun
NO_PROXY='*' HTTP_PROXY='' HTTPS_PROXY='' \
  bun --preload ./bun-preload.ts src/entrypoints/cli.tsx "$@"
