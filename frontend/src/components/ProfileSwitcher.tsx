import * as SelectPrimitive from '@radix-ui/react-select'
import { Link } from '@tanstack/react-router'
import { useAtom, useAtomValue } from 'jotai'
import { useMemo, useState } from 'react'
import { Settings2 } from 'lucide-react'

import {
    Select,
    SelectContent,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/Select'
import { Switch } from '@/components/ui/Switch'
import {
    profileOptionsAtom,
    selectedProfileAtom,
    selectedProfileRunningAtom,
} from '@/lib/profile-store'

/** 根据运行状态返回下拉项状态点样式，绿色表示运行中，灰色表示未运行。 */
function getProfileStatusDotClassName(running: boolean) {
    return running
        ? 'bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.16)]'
        : 'bg-slate-400 shadow-[0_0_0_3px_rgba(148,163,184,0.14)]'
}

/** 根据当前配置与其他配置的运行情况，返回 trigger 状态指示器样式。 */
function getTriggerStatusIndicatorClassNames(currentRunning: boolean, otherRunning: boolean) {
    if (currentRunning && otherRunning) {
        return {
            inner: 'bg-emerald-500 profile-status-dot-breathe',
            outer: 'bg-emerald-300/20 profile-status-ring-glow',
        }
    }

    if (currentRunning) {
        return {
            inner: 'bg-emerald-500 profile-status-dot-breathe',
            outer: 'bg-slate-400/20',
        }
    }

    if (otherRunning) {
        return {
            inner: 'bg-slate-400',
            outer: 'bg-emerald-300/20 profile-status-ring-glow',
        }
    }

    return {
        inner: 'bg-slate-400',
        outer: 'bg-slate-400/20',
    }
}

/** 标题栏配置切换区组件，统一承载配置选择与自动烧录开关 */
export function ProfileSwitcher() {
    const [selectedProfileRunning, setSelectedProfileRunning] = useAtom(selectedProfileRunningAtom)
    const profileOptions = useAtomValue(profileOptionsAtom)
    const [selectedProfile, setSelectedProfile] = useAtom(selectedProfileAtom)
    const [selectOpen, setSelectOpen] = useState(false)

    /** 当前选中配置的显示名称，删除后会自动回落到可用配置 */
    const selectedProfileLabel = useMemo(
        () => profileOptions.find((option) => option.value === selectedProfile)?.label,
        [profileOptions, selectedProfile]
    )

    /** 统计除当前配置外是否还有其他配置正在运行，用于决定外圈表现。 */
    const otherProfilesRunning = useMemo(
        () => profileOptions.some((option) => option.value !== selectedProfile && option.running),
        [profileOptions, selectedProfile]
    )

    /** trigger 左侧状态指示器需要同时反映当前配置和全局运行态。 */
    const triggerIndicatorClassNames = useMemo(
        () => getTriggerStatusIndicatorClassNames(selectedProfileRunning, otherProfilesRunning),
        [otherProfilesRunning, selectedProfileRunning]
    )

    return (
        <div className="flex items-center gap-2">
            <Select open={selectOpen} onOpenChange={setSelectOpen} value={selectedProfile} onValueChange={setSelectedProfile}>
                {/* 用相对定位叠放开关，既保留“开关在选择器内部”的视觉效果，也避免 button 嵌套 button */}
                <div className="relative w-[180px]">
                    <SelectTrigger className="h-8 w-[180px] border-none bg-transparent px-2.5 pr-1.5 text-sm shadow-none hover:bg-accent/70 focus:ring-0">
                        <div className="flex min-w-0 flex-1 items-center" title="点击切换配置">
                            {/* 左侧双圆状态指示器用于概览当前配置与其他配置的运行关系。 */}
                            <span
                                aria-hidden="true"
                                className={`mr-2 inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full transition-[background-color,box-shadow] ${triggerIndicatorClassNames.outer}`}
                            >
                                <span
                                    className={`h-2.5 w-2.5 rounded-full transition-[background-color,opacity,transform] ${triggerIndicatorClassNames.inner}`}
                                />
                            </span>
                            {/* 仅将标题文本相对状态指示器上移 1px，优化视觉重心。 */}
                            <span className="min-w-0 translate-y-[-1px]">
                                <SelectValue placeholder="选择配置">
                                    {selectedProfileLabel}
                                </SelectValue>
                            </span>
                        </div>
                    </SelectTrigger>
                    {/* 开关绝对定位在触发器内部右侧，单独承载点击事件 */}
                    <div className="pointer-events-none absolute inset-y-0 right-7 flex items-center">
                        <Switch
                            className="pointer-events-auto"
                            title="切换自动烧录"
                            aria-label="切换自动烧录"
                            checked={selectedProfileRunning}
                            onCheckedChange={setSelectedProfileRunning}
                        />
                    </div>
                </div>
                <SelectContent align="start">
                    {profileOptions.map((option) => (
                        <SelectPrimitive.Item
                            key={option.value}
                            value={option.value}
                            className="relative flex w-full cursor-default select-none items-center gap-2 rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                        >
                            {/* 用小圆点直观表示当前配置是否处于运行状态。 */}
                            <span
                                aria-hidden="true"
                                className={`h-2.5 w-2.5 rounded-full transition-colors ${getProfileStatusDotClassName(option.running)}`}
                            />
                            <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                        </SelectPrimitive.Item>
                    ))}
                    <SelectSeparator />
                    <Link
                        to="/profile-manage"
                        className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground"
                        onClick={() => setSelectOpen(false)}
                    >
                        <Settings2 className="h-4 w-4" />
                        管理配置
                    </Link>
                </SelectContent>
            </Select>
        </div>
    )
}