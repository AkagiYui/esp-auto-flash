import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

export const Route = createFileRoute('/settings')({ component: SettingsPage })

/** 设置页面组件 - 提供应用配置的模拟界面 */
function SettingsPage() {
    const [autoConnect, setAutoConnect] = useState(true)
    const [darkMode, setDarkMode] = useState(false)
    const [notifications, setNotifications] = useState(true)
    const [autoUpdate, setAutoUpdate] = useState(false)
    const [baudRate, setBaudRate] = useState('115200')
    const [serialPort, setSerialPort] = useState('/dev/ttyUSB0')
    const [logLevel, setLogLevel] = useState('info')

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">设置</h1>
                <p className="text-sm text-muted-foreground">管理应用程序的偏好设置和连接配置。</p>
            </div>

            {/* 通用设置 */}
            <Card>
                <CardHeader>
                    <CardTitle>通用设置</CardTitle>
                    <CardDescription>配置应用程序的基本行为。</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* 深色模式 */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>深色模式</Label>
                            <p className="text-sm text-muted-foreground">切换应用的外观主题。</p>
                        </div>
                        <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                    </div>
                    <Separator />

                    {/* 通知 */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>桌面通知</Label>
                            <p className="text-sm text-muted-foreground">刷写完成或出错时发送系统通知。</p>
                        </div>
                        <Switch checked={notifications} onCheckedChange={setNotifications} />
                    </div>
                    <Separator />

                    {/* 自动更新 */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>自动检查更新</Label>
                            <p className="text-sm text-muted-foreground">启动时自动检查是否有新版本。</p>
                        </div>
                        <Switch checked={autoUpdate} onCheckedChange={setAutoUpdate} />
                    </div>
                    <Separator />

                    {/* 日志级别 */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>日志级别</Label>
                            <p className="text-sm text-muted-foreground">控制日志输出的详细程度。</p>
                        </div>
                        <Select value={logLevel} onValueChange={setLogLevel}>
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="debug">Debug</SelectItem>
                                <SelectItem value="info">Info</SelectItem>
                                <SelectItem value="warn">Warn</SelectItem>
                                <SelectItem value="error">Error</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* 串口连接设置 */}
            <Card>
                <CardHeader>
                    <CardTitle>串口连接</CardTitle>
                    <CardDescription>配置 ESP 设备的串口通信参数。</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* 自动连接 */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>自动连接设备</Label>
                            <p className="text-sm text-muted-foreground">检测到设备时自动建立连接。</p>
                        </div>
                        <Switch checked={autoConnect} onCheckedChange={setAutoConnect} />
                    </div>
                    <Separator />

                    {/* 串口路径 */}
                    <div className="space-y-2">
                        <Label htmlFor="serial-port">默认串口路径</Label>
                        <Input
                            id="serial-port"
                            value={serialPort}
                            onChange={(e) => setSerialPort(e.target.value)}
                            placeholder="/dev/ttyUSB0"
                        />
                        <p className="text-xs text-muted-foreground">指定默认使用的串口设备路径。</p>
                    </div>
                    <Separator />

                    {/* 波特率 */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>波特率</Label>
                            <p className="text-sm text-muted-foreground">串口通信的数据传输速率。</p>
                        </div>
                        <Select value={baudRate} onValueChange={setBaudRate}>
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="9600">9600</SelectItem>
                                <SelectItem value="115200">115200</SelectItem>
                                <SelectItem value="230400">230400</SelectItem>
                                <SelectItem value="460800">460800</SelectItem>
                                <SelectItem value="921600">921600</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* 操作按钮 */}
            <div className="flex justify-end gap-3">
                <Button variant="outline">重置默认</Button>
                <Button>保存设置</Button>
            </div>
        </div>
    )
}
