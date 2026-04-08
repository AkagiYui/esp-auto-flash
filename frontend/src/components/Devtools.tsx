import { lazy, Suspense } from 'react'

// 仅在开发模式加载路由调试工具，避免影响生产构建体积。
const TanStackRouterDevtools = import.meta.env.DEV
    ? lazy(async () => {
        const mod = await import('@tanstack/react-router-devtools')
        return { default: mod.TanStackRouterDevtools }
    })
    : null

// Jotai Devtools 仅用于开发态排查原子状态，不在生产环境渲染。
const JotaiDevTools = import.meta.env.DEV
    ? lazy(async () => {
        const [mod, styles] = await Promise.all([
            import('jotai-devtools'),
            import('jotai-devtools/styles.css?inline'),
        ])

        function JotaiDevToolsWithStyles() {
            return (
                <>
                    {/* Jotai Devtools 依赖自身样式，开发态以内联方式注入以兼容 Vite 按需加载。 */}
                    <style>{styles.default}</style>
                    <mod.DevTools position="bottom-left" />
                </>
            )
        }

        return { default: JotaiDevToolsWithStyles }
    })
    : null

export function Devtools() {
    if (!import.meta.env.DEV || !TanStackRouterDevtools || !JotaiDevTools) {
        return null
    }

    return (
        <Suspense fallback={null}>
            <TanStackRouterDevtools position="bottom-right" />
            <JotaiDevTools />
        </Suspense>
    )
}