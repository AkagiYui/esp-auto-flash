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
    autoFlashEnabledAtom,
    profileOptionsAtom,
    selectedProfileAtom,
} from '@/lib/profile-store'

/** 标题栏配置切换区组件，统一承载配置选择与自动烧录开关 */
export function ProfileSwitcher() {
    const [autoFlashEnabled, setAutoFlashEnabled] = useAtom(autoFlashEnabledAtom)
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
                <SelectTrigger className="h-8 w-[180px] border-none bg-transparent px-2.5 text-sm shadow-none hover:bg-accent/70 focus:ring-0">
                    <div className="flex min-w-0 flex-1 items-center" title='点击切换配置'>
                        <SelectValue placeholder="选择配置">
                            {selectedProfileLabel}
                        </SelectValue>
                    </div>
                    {/* 在触发器内部单独拦截事件，避免点击开关时误触发下拉框 */}
                    <div
                        className="mr-3 flex items-center"
                        onClick={(event) => event.stopPropagation()}
                        onPointerDown={(event) => event.stopPropagation()}
                    >
                        <Switch
                            title="切换自动烧录"
                            aria-label="切换自动烧录"
                            checked={autoFlashEnabled}
                            onCheckedChange={setAutoFlashEnabled}
                        />
                    </div>
                </SelectTrigger>
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