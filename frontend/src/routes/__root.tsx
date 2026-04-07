import { Link, Outlet, createRootRoute } from '@tanstack/react-router'
import { Home, Settings } from 'lucide-react'

import '../styles.css'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export const Route = createRootRoute({
    component: RootComponent,
})

/** 根布局组件 - 包含顶部导航和页面容器 */
function RootComponent() {
    return (
        <div className="min-h-screen bg-background">
            {/* 顶部导航栏 - 高度与 InvisibleTitleBarHeight(38px) 匹配，左侧留出红绿灯空间 */}
            <header
                className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
                style={{ '--wails-draggable': 'drag' } as React.CSSProperties}
            >
                <div className="mx-auto flex h-[38px] max-w-5xl items-center pl-[78px] pr-4">
                    <span className="text-sm font-semibold">ESP Auto Flash</span>
                    <Separator orientation="vertical" className="mx-3 h-4" />
                    <nav className="flex items-center gap-0.5" style={{ '--wails-draggable': 'no-drag' } as React.CSSProperties}>
                        <Button variant="ghost" size="sm" asChild>
                            <Link to="/">
                                <Home className="h-4 w-4" />
                                首页
                            </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                            <Link to="/settings">
                                <Settings className="h-4 w-4" />
                                设置
                            </Link>
                        </Button>
                    </nav>
                </div>
            </header>

            {/* 页面内容区 */}
            <main className="mx-auto max-w-5xl px-4 py-6">
                <Outlet />
            </main>
        </div>
    )
}