import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

import { Button } from '@/components/ui/Button'

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
                <div
                    className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4"
                    onClick={() => handleClose(false)}
                >
                    <div
                        className="w-full max-w-md rounded-xl border bg-card p-5 text-card-foreground shadow-2xl"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="confirm-dialog-title"
                        aria-describedby="confirm-dialog-description"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="space-y-2">
                            <h3 id="confirm-dialog-title" className="text-base font-semibold">
                                {request.title}
                            </h3>
                            <p id="confirm-dialog-description" className="text-sm leading-6 text-muted-foreground">
                                {request.description}
                            </p>
                        </div>

                        <div className="mt-5 flex justify-end gap-2">
                            <Button variant="outline" type="button" onClick={() => handleClose(false)}>
                                {request.cancelText}
                            </Button>
                            <Button
                                variant={request.variant === 'destructive' ? 'destructive' : 'default'}
                                type="button"
                                onClick={() => handleClose(true)}
                            >
                                {request.confirmText}
                            </Button>
                        </div>
                    </div>
                </div>
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