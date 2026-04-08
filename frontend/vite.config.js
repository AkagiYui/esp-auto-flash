import { defineConfig } from 'vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import wails from '@wailsio/runtime/plugins/vite'

/**
 * 为 Jotai atom 自动补充 debugLabel，便于在 devtools 中按变量名识别状态。
 * 仅在开发模式下启用，避免影响生产构建输出。
 */
function jotaiDebugLabelPlugin() {
  const atomDeclarationPattern = /export\s+const\s+([A-Za-z_$][\w$]*Atom)\s*=\s*atom(?:\s*<[^\n]+?>)?\s*\(/g

  return {
    name: 'jotai-debug-label',
    enforce: 'pre',
    apply: 'serve',
    transform(code, id) {
      if (!id.includes('/src/') || !/\.(ts|tsx)$/.test(id)) {
        return null
      }

      if (!code.includes("from 'jotai'") && !code.includes('from "jotai"')) {
        return null
      }

      const atomNames = Array.from(code.matchAll(atomDeclarationPattern), (match) => match[1])

      if (atomNames.length === 0) {
        return null
      }

      const missingDebugLabels = atomNames.filter((atomName) => !code.includes(`${atomName}.debugLabel`))

      if (missingDebugLabels.length === 0) {
        return null
      }

      const injectedCode = `${code}\n\nif (import.meta.env.DEV) {\n${missingDebugLabels
        .map((atomName) => `  ${atomName}.debugLabel = '${atomName}'`)
        .join('\n')}\n}\n`

      return {
        code: injectedCode,
        map: null,
      }
    },
  }
}

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    tailwindcss(),
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    jotaiDebugLabelPlugin(),
    viteReact(),
    wails('./bindings'),
  ],
})
