import {
    closestCenter,
    DndContext,
    type DragEndEvent,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import * as SelectPrimitive from '@radix-ui/react-select'
import { useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, GripVertical, Pencil, Plus, Settings2, X } from 'lucide-react'

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

type ProfileOption = {
    label: string
    value: string
}

type SortableProfileItemProps = {
    index: number
    option: ProfileOption
    selectedProfile: string
    totalCount: number
    onMoveDown: (profileValue: string) => void
    onMoveUp: (profileValue: string) => void
    onRename: (profileValue: string) => void
    onDelete: (profileValue: string) => void
}

/** 可排序的配置项，统一封装拖拽句柄、位移动画与行内操作按钮 */
function SortableProfileItem({
    index,
    option,
    selectedProfile,
    totalCount,
    onMoveDown,
    onMoveUp,
    onRename,
    onDelete,
}: SortableProfileItemProps) {
    const {
        attributes,
        isDragging,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: option.value })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    const isSelected = option.value === selectedProfile
    const isLast = index === totalCount - 1

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={[
                'flex items-center gap-3 rounded-lg border px-3 py-2 bg-background/70',
                isDragging ? 'border-accent bg-accent/15 shadow-sm' : 'border-border/80',
            ].join(' ')}
        >
            <button
                type="button"
                className="flex h-8 w-8 cursor-grab items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground active:cursor-grabbing"
                title="拖拽调整顺序"
                aria-label={`拖拽排序 ${option.label}`}
                {...attributes}
                {...listeners}
            >
                <GripVertical className="h-4 w-4" />
            </button>

            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-foreground">{option.label}</p>
                    {isSelected ? (
                        <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] text-accent-foreground">
                            当前使用
                        </span>
                    ) : null}
                </div>
            </div>

            <div className="flex items-center gap-1">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={index === 0}
                    onClick={() => onMoveUp(option.value)}
                >
                    <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={isLast}
                    onClick={() => onMoveDown(option.value)}
                >
                    <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onRename(option.value)}
                >
                    <Pencil className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => onDelete(option.value)}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}

/** 标题栏配置切换区组件，统一承载配置选择与自动烧录开关 */
export function ProfileSwitcher() {
    const [autoFlashEnabled, setAutoFlashEnabled] = useState(false)
    const [profileOptions, setProfileOptions] = useState(initialProfileOptions)
    const [selectedProfile, setSelectedProfile] = useState(initialProfileOptions[0]?.value ?? '')
    const [selectOpen, setSelectOpen] = useState(false)
    const [manageDialogOpen, setManageDialogOpen] = useState(false)
    const [renameDialogOpen, setRenameDialogOpen] = useState(false)
    const [renamingProfileValue, setRenamingProfileValue] = useState('')
    const [renameInputValue, setRenameInputValue] = useState('')
    const confirm = useConfirm()
    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } })
    )

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
    }

    /** 打开统一的配置管理弹窗，将列表级操作集中到单独界面中处理 */
    function openManageDialog() {
        setSelectOpen(false)
        setManageDialogOpen(true)
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

    /** 将指定配置移动到目标配置位置，用于拖拽排序和按钮排序复用同一套逻辑 */
    function handleReorderProfiles(sourceProfileValue: string, targetProfileValue: string) {
        setProfileOptions((currentOptions) => {
            const sourceIndex = currentOptions.findIndex((option) => option.value === sourceProfileValue)
            const targetIndex = currentOptions.findIndex((option) => option.value === targetProfileValue)

            if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) {
                return currentOptions
            }

            return arrayMove(currentOptions, sourceIndex, targetIndex)
        })
    }

    /** 将配置项向上移动一位，保留按钮式排序作为拖拽的补充交互 */
    function handleMoveProfileUp(profileValue: string) {
        const currentIndex = profileOptions.findIndex((option) => option.value === profileValue)

        if (currentIndex <= 0) {
            return
        }

        handleReorderProfiles(profileValue, profileOptions[currentIndex - 1].value)
    }

    /** 将配置项向下移动一位，便于精确调整少量顺序 */
    function handleMoveProfileDown(profileValue: string) {
        const currentIndex = profileOptions.findIndex((option) => option.value === profileValue)

        if (currentIndex === -1 || currentIndex >= profileOptions.length - 1) {
            return
        }

        handleReorderProfiles(profileValue, profileOptions[currentIndex + 1].value)
    }

    /** 处理拖拽排序完成后的列表重排，dnd-kit 会自动驱动过渡动画 */
    function handleDragEnd(event: DragEndEvent) {
        const activeProfileValue = String(event.active.id)
        const overProfileValue = event.over ? String(event.over.id) : ''

        if (!overProfileValue || activeProfileValue === overProfileValue) {
            return
        }

        handleReorderProfiles(activeProfileValue, overProfileValue)
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
                            className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                        >
                            <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                        </SelectPrimitive.Item>
                    ))}
                    <SelectSeparator />
                    <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground"
                        onClick={openManageDialog}
                    >
                        <Settings2 className="h-4 w-4" />
                        管理配置
                    </button>
                </SelectContent>
            </Select>

            <Dialog open={manageDialogOpen} onOpenChange={setManageDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>管理配置</DialogTitle>
                        <DialogDescription>
                            统一管理配置的名称、显示顺序和删除操作。可直接拖拽列表项调整顺序，修改会立即反映到标题栏下拉菜单。
                        </DialogDescription>
                    </DialogHeader>

                    <DndContext collisionDetection={closestCenter} sensors={sensors} onDragEnd={handleDragEnd}>
                        <SortableContext items={profileOptions.map((option) => option.value)} strategy={verticalListSortingStrategy}>
                            <div className="space-y-2 pt-2">
                                {profileOptions.map((option, index) => (
                                    <SortableProfileItem
                                        key={option.value}
                                        index={index}
                                        option={option}
                                        selectedProfile={selectedProfile}
                                        totalCount={profileOptions.length}
                                        onMoveDown={handleMoveProfileDown}
                                        onMoveUp={handleMoveProfileUp}
                                        onRename={requestRenameProfile}
                                        onDelete={(profileValue) => {
                                            void requestDeleteProfile(profileValue)
                                        }}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>

                    <DialogFooter className="flex items-center justify-between sm:justify-between">
                        <Button type="button" onClick={handleCreateProfile}>
                            <Plus className="h-4 w-4" />
                            新增配置
                        </Button>
                        <Button variant="outline" type="button" onClick={() => setManageDialogOpen(false)}>
                            完成
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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