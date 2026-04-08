import { lazy, Suspense } from 'react'
import { Outlet, createRootRoute } from '@tanstack/react-router'

import '../styles.css'
import { TitleBar } from '@/components/TitleBar'
import { ConfirmDialogProvider } from '@/components/ui/ConfirmDialog'

// 仅在开发模式加载调试工具，避免影响生产构建与运行时体积。
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

export const Route = createRootRoute({
    component: RootComponent,
})

/** 根布局组件 - 包含顶部导航和页面容器 */
function RootComponent() {
    return (
        <ConfirmDialogProvider>
            <>
                <div className="flex h-screen flex-col overflow-hidden bg-background">
                    <TitleBar />

                    {/* 页面内容区 - 仅此区域滚动，避免窗口级滚动条覆盖整个高度 */}
                    <main className="flex-1 overflow-hidden">
                        <div className="route-scroll-area h-full overflow-y-auto">
                            <div className="mx-auto max-w-5xl px-4 py-6">
                                <Outlet />
                            </div>
                        </div>
                    </main>
                </div>

                {import.meta.env.DEV && TanStackRouterDevtools && JotaiDevTools ? (
                    <Suspense fallback={null}>
                        <TanStackRouterDevtools position="bottom-right" />
                        <JotaiDevTools />
                    </Suspense>
                ) : null}
            </>
        </ConfirmDialogProvider>
    )
}