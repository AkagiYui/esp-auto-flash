/**
 * 为 Jotai atom 自动补充 debugLabel，便于在 devtools 中按变量名识别状态。
 * 仅在开发模式下启用，避免影响生产构建输出。
 */
export function jotaiDebugLabelPlugin() {
    const atomDeclarationPattern = /export\s+const\s+([A-Za-z_$][\w$]*Atom)\s*=\s*atom(?:\s*<[^\n]+?>)?\s*\(/g

    return {
        name: 'jotai-debug-label',
        enforce: 'pre' as const,
        apply: 'serve' as const,
        transform(code: string, id: string) {
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