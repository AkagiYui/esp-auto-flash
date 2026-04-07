import * as SelectPrimitive from '@radix-ui/react-select'
import { useMemo, useState } from 'react'
import { Plus, X } from 'lucide-react'

import {
    Select,
    SelectContent,
    SelectItem,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/Select'
import { Switch } from '@/components/ui/Switch'

/** 模拟配置列表，后续再接入真实配置管理逻辑 */
const initialProfileOptions = [
    { label: '默认配置', value: 'default' },
    { label: '开发板配置', value: 'dev-board' },
    { label: '量产配置', value: 'factory' },
]

/** 标题栏配置切换区组件，统一承载配置选择与自动烧录开关 */
export function ProfileSwitcher() {
    const [autoFlashEnabled, setAutoFlashEnabled] = useState(false)
    const [profileOptions, setProfileOptions] = useState(initialProfileOptions)
    const [selectedProfile, setSelectedProfile] = useState(initialProfileOptions[0]?.value ?? '')

    /** 当前选中配置的显示名称，删除后会自动回落到可用配置 */
    const selectedProfileLabel = useMemo(
        () => profileOptions.find((option) => option.value === selectedProfile)?.label,
        [profileOptions, selectedProfile]
    )

    /** 删除配置前先确认，避免在标题栏区域误触导致配置丢失 */
    function handleDeleteProfile(profileValue: string) {
        console.log(123)
        const profile = profileOptions.find((option) => option.value === profileValue)
        if (!profile) {
            return
        }

        const confirmed = window.confirm(`确认删除配置“${profile.label}”吗？`)

        if (!confirmed) {
            return
        }

        const nextProfileOptions = profileOptions.filter((option) => option.value !== profileValue)
        setProfileOptions(nextProfileOptions)

        if (selectedProfile !== profileValue) {
            return
        }

        setSelectedProfile(nextProfileOptions[0]?.value ?? '')
    }

    return (
        <div className="flex items-center gap-2">
            <Select value={selectedProfile} onValueChange={setSelectedProfile}>
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
                            className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-10 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                        >
                            <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                            <button
                                type="button"
                                className="absolute right-2 inline-flex h-5 w-5 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                aria-label={`删除配置 ${option.label}`}
                                title={`删除配置 ${option.label}`}
                                onPointerDown={(event) => {
                                    event.preventDefault()
                                    event.stopPropagation()
                                    handleDeleteProfile(option.value)
                                }}
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </SelectPrimitive.Item>
                    ))}
                    <SelectSeparator />
                    <SelectItem value="create-new">
                        <span className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            新增配置
                        </span>
                    </SelectItem>
                </SelectContent>
            </Select>
        </div>
    )
}