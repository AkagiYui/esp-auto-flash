import { useState } from 'react'
import { Plus } from 'lucide-react'

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
const profileOptions = [
    { label: '默认配置', value: 'default' },
    { label: '开发板配置', value: 'dev-board' },
    { label: '量产配置', value: 'factory' },
]

/** 标题栏配置切换区组件，统一承载配置选择与自动烧录开关 */
export function ProfileSwitcher() {
    const [autoFlashEnabled, setAutoFlashEnabled] = useState(false)

    return (
        <div className="flex items-center gap-2">
            <Select defaultValue="default">
                <SelectTrigger className="h-8 w-[180px] border-none bg-transparent px-2.5 text-sm shadow-none hover:bg-accent/70 focus:ring-0">
                    <div className="flex min-w-0 flex-1 items-center">
                        <SelectValue placeholder="选择配置" />
                    </div>
                    {/* 在触发器内部单独拦截事件，避免点击开关时误触发下拉框 */}
                    <div
                        className="mr-3 flex items-center"
                        onClick={(event) => event.stopPropagation()}
                        onPointerDown={(event) => event.stopPropagation()}
                    >
                        <Switch
                            aria-label="切换自动烧录"
                            checked={autoFlashEnabled}
                            onCheckedChange={setAutoFlashEnabled}
                        />
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
                            新增配置
                        </span>
                    </SelectItem>
                </SelectContent>
            </Select>
        </div>
    )
}