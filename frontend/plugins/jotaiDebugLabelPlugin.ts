/**
 * 为 Jotai 开发态补充调试能力：
 * 1. 在入口文件最早注入 jotai-devtools，确保默认 store 创建前完成挂钩。
 * 2. 为 Jotai atom 自动补充 debugLabel，便于在 devtools 中按变量名识别状态。
 * 仅在开发模式下启用，避免影响生产构建输出。
 */
export function jotaiDebugLabelPlugin() {
    const atomDeclarationPattern = /export\s+const\s+([A-Za-z_$][\w$]*Atom)\s*=\s*atom(?:\s*<[^\n]+?>)?\s*\(/g
    const jotaiDevtoolsImport = `import 'jotai-devtools'`
    const entryFiles = new Set<string>()

    return {
        name: 'jotai-debug-label',
        enforce: 'pre' as const,
        apply: 'serve' as const,
        transformIndexHtml(html: string) {
            // 从 HTML 模块脚本中提取实际入口，避免和具体入口路径耦合。
            const moduleScriptPattern = /<script\s+[^>]*type=["']module["'][^>]*src=["']([^"']+)["'][^>]*><\/script>/g

            for (const match of html.matchAll(moduleScriptPattern)) {
                const scriptSrc = match[1]

                if (scriptSrc.startsWith('/src/')) {
                    entryFiles.add(scriptSrc.slice(1))
                }
            }

            return html
        },
        transform(code: string, id: string) {
            // 在应用入口最早注入 devtools，确保默认 store 会被调试钩子接管。
            if (Array.from(entryFiles).some((entryFile) => id.endsWith(`/${entryFile}`)) && !code.includes(jotaiDevtoolsImport)) {
                return {
                    code: `${jotaiDevtoolsImport}\n${code}`,
                    map: null,
                }
            }

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