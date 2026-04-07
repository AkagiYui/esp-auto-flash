import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

type ConfirmDialogOptions = {
    cancelText?: string
    confirmText?: string
    description: string
    title: string
    variant?: 'default' | 'destructive'
}

type ConfirmDialogRequest = ConfirmDialogOptions & {
    resolve: (confirmed: boolean) => void
}

type ConfirmDialogContextValue = {
    confirm: (options: ConfirmDialogOptions) => Promise<boolean>
}

const ConfirmDialogContext = createContext<ConfirmDialogContextValue | null>(null)

/** 确认弹窗传送门，统一挂载到顶层避免层级冲突 */
const ConfirmDialogPortal = AlertDialogPrimitive.Portal

/** 确认弹窗遮罩层，复用现有模态视觉表现并由 Radix 负责无障碍语义 */
function ConfirmDialogOverlay({ className, ...props }: AlertDialogPrimitive.AlertDialogOverlayProps) {
    return (
        <AlertDialogPrimitive.Overlay
            className={cn(
                'fixed inset-0 z-50 bg-black/50 backdrop-blur-[1px] data-[state=closed]:animate-out data-[state=open]:animate-in',
                className
            )}
            {...props}
        />
    )
}

/** 确认弹窗内容容器，统一处理布局和层级 */
function ConfirmDialogContent({ className, ...props }: AlertDialogPrimitive.AlertDialogContentProps) {
    return (
        <ConfirmDialogPortal>
            <ConfirmDialogOverlay />
            <AlertDialogPrimitive.Content
                className={cn(
                    'fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-card p-5 text-card-foreground shadow-2xl duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in focus-visible:outline-none',
                    className
                )}
                {...props}
            />
        </ConfirmDialogPortal>
    )
}

/** 通用确认弹窗提供器，统一管理全局确认交互与函数式唤起能力 */
export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
    const [request, setRequest] = useState<ConfirmDialogRequest | null>(null)

    /** 以 Promise 形式暴露确认能力，便于业务代码按函数方式调用 */
    const confirm = useCallback((options: ConfirmDialogOptions) => {
        return new Promise<boolean>((resolve) => {
            setRequest({
                cancelText: '取消',
                confirmText: '确认',
                variant: 'default',
                ...options,
                resolve,
            })
        })
    }, [])

    /** 统一关闭弹窗并回传确认结果，避免业务侧重复维护状态 */
    function handleClose(confirmed: boolean) {
        if (!request) {
            return
        }

        request.resolve(confirmed)
        setRequest(null)
    }

    const contextValue = useMemo(() => ({ confirm }), [confirm])

    return (
        <ConfirmDialogContext.Provider value={contextValue}>
            {children}

            {request ? (
                <AlertDialogPrimitive.Root
                    open
                    onOpenChange={(open) => {
                        if (!open) {
                            handleClose(false)
                        }
                    }}
                >
                    <ConfirmDialogContent>
                        <div className="space-y-2">
                            <AlertDialogPrimitive.Title className="text-base font-semibold">
                                {request.title}
                            </AlertDialogPrimitive.Title>
                            <AlertDialogPrimitive.Description className="text-sm leading-6 text-muted-foreground">
                                {request.description}
                            </AlertDialogPrimitive.Description>
                        </div>

                        <div className="mt-5 flex justify-end gap-2">
                            <AlertDialogPrimitive.Cancel asChild>
                                <Button variant="outline" type="button" onClick={() => handleClose(false)}>
                                    {request.cancelText}
                                </Button>
                            </AlertDialogPrimitive.Cancel>
                            <AlertDialogPrimitive.Action asChild>
                                <Button
                                    variant={request.variant === 'destructive' ? 'destructive' : 'default'}
                                    type="button"
                                    onClick={() => handleClose(true)}
                                >
                                    {request.confirmText}
                                </Button>
                            </AlertDialogPrimitive.Action>
                        </div>
                    </ConfirmDialogContent>
                </AlertDialogPrimitive.Root>
            ) : null}
        </ConfirmDialogContext.Provider>
    )
}

/** 业务侧通过 hook 以函数方式唤起确认弹窗 */
export function useConfirm() {
    const context = useContext(ConfirmDialogContext)

    if (!context) {
        throw new Error('useConfirm 必须在 ConfirmDialogProvider 内使用')
    }

    return context.confirm
}

export type { ConfirmDialogOptions }