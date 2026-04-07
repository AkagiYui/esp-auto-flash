import { createFileRoute } from '@tanstack/react-router'
import { Activity, Clock3, Cpu, TriangleAlert } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'

export const Route = createFileRoute('/logs')({ component: LogsPage })

/** 模拟日志统计数据，后续可替换为设备实时事件与刷写结果聚合 */
const logStats = [
    {
        title: '今日日志数',
        value: '128',
        description: '包含串口探测、连接与刷写阶段输出。',
        icon: Activity,
    },
    {
        title: '最近设备',
        value: 'ESP32-S3',
        description: '最近一次上报日志的目标设备型号。',
        icon: Cpu,
    },
    {
        title: '最近告警',
        value: '2 条',
        description: '主要集中在连接重试与握手超时。',
        icon: TriangleAlert,
    },
]

/** 模拟时间线数据，用于占位展示日志页面布局和信息层级 */
const mockLogs = [
    {
        time: '10:42:18',
        level: 'INFO',
        source: 'serial-monitor',
        message: '检测到新设备 /dev/cu.usbmodem21301，准备建立连接。',
    },
    {
        time: '10:42:21',
        level: 'DEBUG',
        source: 'flash-worker',
        message: '已加载固件清单 bootloader.bin、partition-table.bin、app.bin。',
    },
    {
        time: '10:42:24',
        level: 'WARN',
        source: 'transport',
        message: '首次握手响应超时，系统已自动发起第 2 次重试。',
    },
    {
        time: '10:42:29',
        level: 'INFO',
        source: 'flash-worker',
        message: '重试成功，开始写入主固件分区，当前进度 36%。',
    },
    {
        time: '10:42:35',
        level: 'INFO',
        source: 'runtime',
        message: '收到设备状态回传：写入速度稳定，校验流程已排队。',
    },
]

/** 日志页面组件 - 展示模拟统计信息和最近日志时间线 */
function LogsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">日志</h1>
                    <p className="text-sm text-muted-foreground">
                        这里先使用假数据展示设备日志、刷写状态和异常提示的未来布局。
                    </p>
                </div>
                <div className="hidden items-center gap-2 rounded-full border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground sm:flex">
                    <Clock3 className="h-3.5 w-3.5" />
                    最近同步于 10:42:35
                </div>
            </div>

            {/* 顶部统计卡片用于快速概览日志健康度与活跃设备 */}
            <div className="grid gap-4 md:grid-cols-3">
                {logStats.map(({ title, value, description, icon: Icon }) => (
                    <Card key={title}>
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <CardDescription>{title}</CardDescription>
                                    <CardTitle className="mt-1 text-2xl">{value}</CardTitle>
                                </div>
                                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                                    <Icon className="h-5 w-5" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
                <Card>
                    <CardHeader>
                        <CardTitle>最近日志</CardTitle>
                        <CardDescription>按时间倒序展示最近一次模拟刷写任务中的关键日志。</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {mockLogs.map((item) => (
                            <div
                                key={`${item.time}-${item.source}`}
                                className="rounded-xl border bg-muted/30 p-4"
                            >
                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                    <span className="rounded-full bg-background px-2 py-1 font-medium text-foreground">
                                        {item.time}
                                    </span>
                                    <span className="rounded-full bg-primary/10 px-2 py-1 font-medium text-primary">
                                        {item.level}
                                    </span>
                                    <span className="text-muted-foreground">{item.source}</span>
                                </div>
                                <p className="mt-3 text-sm leading-6 text-foreground/90">{item.message}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>本次任务摘要</CardTitle>
                        <CardDescription>用假数据模拟后续可展示的运行概览面板。</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[
                            ['任务编号', 'FLASH-20260407-001'],
                            ['目标端口', '/dev/cu.usbmodem21301'],
                            ['固件版本', 'v0.9.3-preview'],
                            ['预计剩余', '约 18 秒'],
                        ].map(([label, value]) => (
                            <div key={label} className="flex items-center justify-between rounded-lg border px-3 py-2.5">
                                <span className="text-sm text-muted-foreground">{label}</span>
                                <span className="text-sm font-medium">{value}</span>
                            </div>
                        ))}

                        <div className="rounded-xl border border-dashed p-4">
                            <p className="text-sm font-medium">后续可接入内容</p>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                可将 Wails 事件流、串口原始输出、错误堆栈与刷写进度统一汇总到该页，作为调试和问题定位入口。
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}