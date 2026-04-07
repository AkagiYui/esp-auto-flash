import * as SelectPrimitive from '@radix-ui/react-select'
import { useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, X } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import {
    Select,
    SelectContent,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/Select'
import { useConfirm } from '@/components/ui/ConfirmDialog'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Switch } from '@/components/ui/Switch'

/** 模拟配置列表，后续再接入真实配置管理逻辑 */
const initialProfileOptions = [
    { label: '默认配置', value: 'default' },
    { label: '开发板配置', value: 'dev-board' },
    { label: '量产配置', value: 'factory' },
]

/** 生成新的模拟配置，后续接入真实数据源时可替换为创建接口返回值 */
function createMockProfile(nextIndex: number) {
    return {
        label: `新配置 ${nextIndex}`,
        value: `mock-profile-${nextIndex}`,
    }
}

/** 标题栏配置切换区组件，统一承载配置选择与自动烧录开关 */
export function ProfileSwitcher() {
    const [autoFlashEnabled, setAutoFlashEnabled] = useState(false)
    const [profileOptions, setProfileOptions] = useState(initialProfileOptions)
    const [selectedProfile, setSelectedProfile] = useState(initialProfileOptions[0]?.value ?? '')
    const [selectOpen, setSelectOpen] = useState(false)
    const [renameDialogOpen, setRenameDialogOpen] = useState(false)
    const [renamingProfileValue, setRenamingProfileValue] = useState('')
    const [renameInputValue, setRenameInputValue] = useState('')
    const confirm = useConfirm()

    /** 当前选中配置的显示名称，删除后会自动回落到可用配置 */
    const selectedProfileLabel = useMemo(
        () => profileOptions.find((option) => option.value === selectedProfile)?.label,
        [profileOptions, selectedProfile]
    )

    /** 当前准备重命名的配置项，用于弹窗内展示与提交时定位目标 */
    const renamingProfile = useMemo(
        () => profileOptions.find((option) => option.value === renamingProfileValue),
        [profileOptions, renamingProfileValue]
    )

    /** 重命名输入内容去除首尾空白后用于校验，避免仅输入空格也被提交 */
    const normalizedRenameValue = renameInputValue.trim()

    /** 点击新增时直接追加一条模拟配置，并自动切换到新建项 */
    function handleCreateProfile() {
        const nextProfile = createMockProfile(profileOptions.length + 1)
        const nextProfileOptions = [...profileOptions, nextProfile]

        setProfileOptions(nextProfileOptions)
        setSelectedProfile(nextProfile.value)
        setSelectOpen(false)
    }

    /** 用户确认后再真正删除配置，避免标题栏区域误触导致配置丢失 */
    function handleDeleteProfile(profileValue: string) {
        const profile = profileOptions.find((option) => option.value === profileValue)

        if (!profile) {
            return
        }

        const nextProfileOptions = profileOptions.filter((option) => option.value !== profileValue)
        setProfileOptions(nextProfileOptions)

        if (selectedProfile !== profileValue) {
            return
        }

        setSelectedProfile(nextProfileOptions[0]?.value ?? '')
    }

    /** 通过全局确认弹窗函数式唤起删除确认，避免在 Select 内部耦合模态框布局 */
    async function requestDeleteProfile(profileValue: string) {
        const profile = profileOptions.find((option) => option.value === profileValue)

        if (!profile) {
            return
        }

        setSelectOpen(false)

        const confirmed = await confirm({
            title: '确认删除配置',
            description: `删除后当前模拟配置列表中将不再保留“${profile.label}”。此操作不可撤销。`,
            confirmText: '确认删除',
            cancelText: '取消',
            variant: 'destructive',
        })

        if (!confirmed) {
            return
        }

        handleDeleteProfile(profileValue)
    }

    /** 打开重命名弹窗并预填当前配置名称，保证在 Wails 环境下也能正常工作 */
    function requestRenameProfile(profileValue: string) {
        const profile = profileOptions.find((option) => option.value === profileValue)

        if (!profile) {
            return
        }

        setSelectOpen(false)

        setRenamingProfileValue(profile.value)
        setRenameInputValue(profile.label)
        setRenameDialogOpen(true)
    }

    /** 提交重命名表单时更新本地模拟配置列表，并在成功后关闭弹窗 */
    function handleRenameSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()

        if (!renamingProfile || !normalizedRenameValue || normalizedRenameValue === renamingProfile.label) {
            return
        }

        setProfileOptions((currentOptions) =>
            currentOptions.map((option) =>
                option.value === renamingProfile.value
                    ? { ...option, label: normalizedRenameValue }
                    : option
            )
        )
        setRenameDialogOpen(false)
    }

    /** 弹窗关闭时清理临时状态，避免下次打开仍残留旧输入 */
    useEffect(() => {
        if (renameDialogOpen) {
            return
        }

        setRenamingProfileValue('')
        setRenameInputValue('')
    }, [renameDialogOpen])

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
                            className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-16 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                        >
                            <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                            <button
                                type="button"
                                className="absolute right-8 inline-flex h-5 w-5 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                aria-label={`重命名配置 ${option.label}`}
                                title={`重命名配置 ${option.label}`}
                                onPointerDown={(event) => {
                                    event.preventDefault()
                                    event.stopPropagation()
                                    requestRenameProfile(option.value)
                                }}
                            >
                                <Pencil className="h-3 w-3" />
                            </button>
                            <button
                                type="button"
                                className="absolute right-2 inline-flex h-5 w-5 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                aria-label={`删除配置 ${option.label}`}
                                title={`删除配置 ${option.label}`}
                                onPointerDown={(event) => {
                                    event.preventDefault()
                                    event.stopPropagation()
                                    void requestDeleteProfile(option.value)
                                }}
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </SelectPrimitive.Item>
                    ))}
                    <SelectSeparator />
                    <button
                        type="button"
                        className="flex pointer w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground"
                        onClick={handleCreateProfile}
                    >
                        <Plus className="h-4 w-4" />
                        新增配置
                    </button>
                </SelectContent>
            </Select>

            <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
                <DialogContent>
                    <form className="space-y-4" onSubmit={handleRenameSubmit}>
                        <DialogHeader>
                            <DialogTitle>重命名配置</DialogTitle>
                            <DialogDescription>
                                修改当前模拟配置的显示名称，保存后会立即反映到下拉菜单中。
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground" htmlFor="profile-rename-input">
                                配置名称
                            </label>
                            <Input
                                id="profile-rename-input"
                                value={renameInputValue}
                                maxLength={32}
                                placeholder="请输入配置名称"
                                autoFocus
                                onChange={(event) => setRenameInputValue(event.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                请输入 1 到 32 个字符。
                            </p>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" type="button" onClick={() => setRenameDialogOpen(false)}>
                                取消
                            </Button>
                            <Button
                                type="submit"
                                disabled={!renamingProfile || !normalizedRenameValue || normalizedRenameValue === renamingProfile.label}
                            >
                                保存名称
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}