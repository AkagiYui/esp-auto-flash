import { Outlet, createRootRoute } from '@tanstack/react-router'

import '../styles.css'
import { TitleBar } from '@/components/TitleBar'

export const Route = createRootRoute({
    component: RootComponent,
})

/** 根布局组件 - 包含顶部导航和页面容器 */
function RootComponent() {
    return (
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
    )
}