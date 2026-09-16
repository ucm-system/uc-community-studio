#!/bin/zsh
set -e
cd "${0:A:h}"
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

if ! command -v node >/dev/null || ! command -v npm >/dev/null; then
  print '需要安装 Node.js 22 或更新的 LTS 版本。安装后重新双击此文件。'
  read '?按回车关闭…'
  exit 1
fi

# Reuse the same origin so an existing browser can still find its IndexedDB drafts.
if curl -fsS --max-time 2 http://127.0.0.1:4173/ 2>/dev/null | grep -q '<title>UC Poster Studio'; then
  open http://127.0.0.1:4173/
  exit 0
fi

if [[ ! -d node_modules ]]; then
  npm ci --no-audit --no-fund
fi
npm run build
print '\nUC Poster Studio 已准备就绪。保留此终端窗口，按 Control+C 停止服务。\n'
npm run preview -- --open
