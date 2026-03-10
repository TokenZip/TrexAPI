#!/usr/bin/env bash
# 在运行前请先: pip install build twine，并配置 PyPI 认证（如 ~/.pypirc 或 TWINE_* 环境变量）
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

for pkg in pypi-tzp pypi-tokenzip; do
  cd "$SCRIPT_DIR/$pkg"
  python3 -m build
  twine upload dist/*
  echo "✓ PyPI $pkg 已发布"
done
echo "PyPI 占位包发布完成。"
