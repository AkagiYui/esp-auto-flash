import { Link } from '@tanstack/react-router'
import { Window } from '@wailsio/runtime'
import { Home, Plus, Settings } from 'lucide-react'
import type { CSSProperties, MouseEvent } from 'react'

import { Button } from '@/components/ui/Button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/Select'

const titleBarDragStyle: CSSProperties = {
    '--wails-draggable': 'drag',
} as CSSProperties

const titleBarNoDragStyle: CSSProperties = {
    '--wails-draggable': 'no-drag',
} as CSSProperties

/** 模拟配置文件列表，后续再接入真实配置管理逻辑 */
const profileOptions = [
    { label: '默认配置', value: 'default' },
    { label: '开发板配置', value: 'dev-board' },
    { label: '量产配置', value: 'factory' },
]

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
                    className="absolute inset-y-0 left-[78px] flex items-center"
                    onDoubleClick={(event) => event.stopPropagation()}
                    style={titleBarNoDragStyle}
                >
                    <Select defaultValue="default">
                        <SelectTrigger className="h-8 w-[190px] gap-2 border-none bg-transparent px-2.5 text-sm shadow-none hover:bg-accent/70 focus:ring-0">
                            <div className="flex min-w-0 items-center gap-2">
                                <span className="rounded-full bg-primary/12 px-1.5 py-0.5 text-[11px] font-semibold text-primary">
                                    配置
                                </span>
                                <SelectValue placeholder="选择配置文件" />
                            </div>
                        </SelectTrigger>
                        <SelectContent align="start">
                            {profileOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                            <SelectSeparator />
                            <SelectItem value="create-new">
                                <span className="flex items-center gap-2">
                                    <Plus className="h-4 w-4" />
                                    新增配置文件
                                </span>
                            </SelectItem>
                        </SelectContent>
                    </Select>
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