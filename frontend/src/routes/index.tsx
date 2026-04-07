import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { ArrowRight, Cpu, PlugZap, Send, TimerReset } from 'lucide-react'
import { Events } from '@wailsio/runtime'

import { GreetService } from '../../bindings/changeme'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Label } from '@/components/ui/Label'

export const Route = createFileRoute('/')({ component: HomePage })

/** 首页组件 - 保留问候交互和事件监听逻辑 */
function HomePage() {
  const [name, setName] = useState('')
  const [result, setResult] = useState('请在下方输入名称')
  const [timeMessage, setTimeMessage] = useState('正在监听 Time 事件...')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const unsubscribe = Events.On('time', (time) => {
      if (typeof time?.data === 'string') {
        setTimeMessage(time.data)
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  /** 调用后端问候服务 */
  async function handleGreet() {
    const trimmedName = name.trim() || 'anonymous'
    setSubmitting(true)

    try {
      const message = await GreetService.Greet(trimmedName)
      setResult(message)
    } catch (error) {
      console.error(error)
      setResult('问候失败，请检查运行时日志。')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 功能卡片区 */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            icon: Cpu,
            title: 'Wails 桌面集成',
            desc: '延续现有 bindings 和事件通道，不重写后端交互方式。',
          },
          {
            icon: PlugZap,
            title: '可持续扩展',
            desc: '以路由和组件边界为核心，为后续刷机流程留出演进空间。',
          },
          {
            icon: TimerReset,
            title: '实时事件入口',
            desc: '保留 time 事件订阅模式，便于后续接日志、进度和设备状态。',
          },
        ].map(({ icon: Icon, title, desc }) => (
          <Card key={title}>
            <CardHeader className="pb-3">
              <Icon className="h-5 w-5 text-primary" />
              <CardTitle className="text-sm">{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 问候交互卡片 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardDescription>Runtime Demo</CardDescription>
                <CardTitle className="text-xl">问候交互</CardTitle>
              </div>
              <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                <Send className="h-5 w-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 问候结果展示 */}
            <div className="rounded-lg border bg-muted/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                Greeting Result
              </p>
              <p className="mt-2 min-h-10 text-sm leading-relaxed">{result}</p>
            </div>

            {/* 名称输入 */}
            <div className="space-y-2">
              <Label htmlFor="name-input">输入名称</Label>
              <Input
                id="name-input"
                type="text"
                autoComplete="off"
                value={name}
                onChange={(event) => setName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !submitting) {
                    void handleGreet()
                  }
                }}
                placeholder="例如：ESP 开发者"
              />
            </div>

            {/* 提交按钮 */}
            <Button
              className="w-full"
              disabled={submitting}
              onClick={() => {
                void handleGreet()
              }}
            >
              <span>{submitting ? '发送中...' : 'Greet'}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>

            {/* 事件监听展示 */}
            <div className="rounded-lg border border-dashed p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-orange-500">
                Time Event
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{timeMessage}</p>
            </div>
          </CardContent>
        </Card>

        {/* 后续规划卡片 */}
        <Card>
          <CardHeader>
            <CardDescription>Next Foundation</CardDescription>
            <CardTitle className="text-xl">适合后续开发的页面骨架</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ['设备发现', '可以在新路由里接串口扫描、设备识别和连接状态。'],
                ['刷写流程', '把固件选择、进度条、日志流、结果页拆成独立模块。'],
                ['异常处理', '对接 Wails 事件后，统一做 toast、日志面板和错误态。'],
                ['信息页面', '后续可补设置页、关于页、调试页，而不再堆在单页面里。'],
              ].map(([title, desc]) => (
                <div key={title} className="rounded-lg border bg-card p-3">
                  <h3 className="text-sm font-semibold">{title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}