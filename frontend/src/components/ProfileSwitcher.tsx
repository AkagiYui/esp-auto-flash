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

    return (
        <div className="flex items-center gap-2">
            <Select open={selectOpen} onOpenChange={setSelectOpen} value={selectedProfile} onValueChange={setSelectedProfile}>
                {/* 用相对定位叠放开关，既保留“开关在选择器内部”的视觉效果，也避免 button 嵌套 button */}
                <div className="relative w-[180px]">
                    <SelectTrigger className="h-8 w-[180px] border-none bg-transparent px-2.5 pr-1.5 text-sm shadow-none hover:bg-accent/70 focus:ring-0">
                        <div className="flex min-w-0 flex-1 items-center" title="点击切换配置">
                            <SelectValue placeholder="选择配置">
                                {selectedProfileLabel}
                            </SelectValue>
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
                            className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                        >
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