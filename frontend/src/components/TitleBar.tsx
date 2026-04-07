import { Link } from '@tanstack/react-router'
import { Window } from '@wailsio/runtime'
import { Home, Settings } from 'lucide-react'
import type { CSSProperties, MouseEvent } from 'react'

import { ProfileSwitcher } from '@/components/ProfileSwitcher'
import { Button } from '@/components/ui/Button'

const titleBarDragStyle: CSSProperties = {
    '--wails-draggable': 'drag',
} as CSSProperties

const titleBarNoDragStyle: CSSProperties = {
    '--wails-draggable': 'no-drag',
} as CSSProperties

/** 双击标题栏中部时切换窗口最大化与恢复 */
async function handleTitleDoubleClick(event: MouseEvent<HTMLDivElement>) {
    event.preventDefault()

    const isMaximised = await Window.IsMaximised()

    if (isMaximised) {
        await Window.UnMaximise()
        return
    }

    await Window.Maximise()
}

/** 应用标题栏组件 - 承载窗口拖拽、导航和配置切换入口 */
export function TitleBar() {
    return (
        <header
            className="z-50 h-[38px] shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
            style={titleBarDragStyle}
        >
            <div
                className="relative h-full w-full cursor-default select-none"
                onDoubleClick={handleTitleDoubleClick}
                title="双击切换窗口最大化"
            >
                {/* 左侧区域紧贴红绿灯右侧，预留 macOS 安全距离 */}
                <div
                    className="absolute inset-y-0 left-[78px] flex items-center gap-3"
                    onDoubleClick={(event) => event.stopPropagation()}
                    style={titleBarNoDragStyle}
                >
                    <ProfileSwitcher />
                </div>

                {/* 中间标题层不接管鼠标事件，避免遮挡左右两侧可交互区域 */}
                <div className="pointer-events-none absolute inset-0 hidden items-center justify-center px-4 md:flex">
                    <div className="flex h-full min-w-[180px] max-w-[40vw] items-center justify-center px-6 text-sm font-semibold tracking-[0.02em]">
                        <span className="truncate">ESP Auto Flash</span>
                    </div>
                </div>

                {/* 右侧区域贴近窗口右边，保留安全边距 */}
                <div
                    className="absolute inset-y-0 right-3 flex items-center"
                    onDoubleClick={(event) => event.stopPropagation()}
                    style={titleBarNoDragStyle}
                >
                    <nav className="flex items-center gap-1">
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
            </div>
        </header>
    )
}