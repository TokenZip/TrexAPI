#!/usr/bin/env bash
# 在运行前请先执行: npm login
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/npm-trexapi"
npm publish --access public
echo "✓ npm trexapi 已发布"
cd "$SCRIPT_DIR/npm-tokenzip"
npm publish --access public
echo "✓ npm tokenzip 已发布"
echo "npm 占位包发布完成。"
