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
    return (
        <div className="flex items-center gap-2">
            <Select defaultValue="default">
                <SelectTrigger className="h-8 w-[160px] border-none bg-transparent px-2.5 text-sm shadow-none hover:bg-accent/70 focus:ring-0">
                    <div className="flex min-w-0 items-center">
                        <SelectValue placeholder="选择配置" />
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

            {/* 自动烧录开关仅提供界面状态，后续再接入真实逻辑 */}
            <label className="flex items-center gap-2 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent/60">
                <span>自动烧录</span>
                <Switch aria-label="切换自动烧录" />
            </label>
        </div>
    )
}