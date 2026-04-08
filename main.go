package main

import (
	"embed"
	_ "embed"
	"log"
	"runtime"
	"time"

	"github.com/wailsapp/wails/v3/pkg/application"
	"github.com/wailsapp/wails/v3/pkg/events"
	"github.com/wailsapp/wails/v3/pkg/icons"
	"github.com/wailsapp/wails/v3/pkg/services/dock"
)

// Wails uses Go's `embed` package to embed the frontend files into the binary.
// Any files in the frontend/dist folder will be embedded into the binary and
// made available to the frontend.
// See https://pkg.go.dev/embed for more information.

//go:embed all:frontend/dist
var assets embed.FS

func init() {
	// Register a custom event whose associated data type is string.
	// This is not required, but the binding generator will pick up registered events
	// and provide a strongly typed JS/TS API for them.
	application.RegisterEvent[string]("time")
}

// main function serves as the application's entry point. It initializes the application, creates a window,
// and starts a goroutine that emits a time-based event every second. It subsequently runs the application and
// logs any error that might occur.
func main() {
	dockService := dock.New()

	// Create a new Wails application by providing the necessary options.
	// Variables 'Name' and 'Description' are for application metadata.
	// 'Assets' configures the asset server with the 'FS' variable pointing to the frontend files.
	// 'Bind' is a list of Go struct instances. The frontend has access to the methods of these instances.
	// 'Mac' options tailor the application when running an macOS.
	app := application.New(application.Options{
		Name:        "esp-auto-flash",
		Description: "A demo of using raw HTML & CSS",
		Services: []application.Service{
			application.NewService(&GreetService{}),
			application.NewService(dockService),
		},
		Assets: application.AssetOptions{
			Handler: application.AssetFileServerFS(assets),
		},
		Mac: application.MacOptions{
			// 关闭最后一个窗口时不退出应用，改为仅保留菜单栏图标。
			ApplicationShouldTerminateAfterLastWindowClosed: false,
		},
	})

	// 统一封装主窗口恢复逻辑，确保恢复时重新显示 Dock 图标并聚焦窗口。
	showMainWindow := func(window application.Window) {
		go func() {
			dockService.ShowAppIcon()
			window.Show().Focus()
		}()
	}

	// 统一封装主窗口隐藏逻辑，隐藏窗口后移除 Dock 图标，仅保留菜单栏图标。
	hideMainWindow := func(window application.Window) {
		go func() {
			window.Hide()
			dockService.HideAppIcon()
		}()
	}

	// Create a new window with the necessary options.
	// 'Title' is the title of the window.
	// 'Mac' options tailor the window when running on macOS.
	// 'BackgroundColour' is the background colour of the window.
	// 'URL' is the URL that will be loaded into the webview.
	// 红绿灯高约12px，系统默认Y偏移约6px，标题栏38px可让红绿灯大致垂直居中
	mainWindow := app.Window.NewWithOptions(application.WebviewWindowOptions{
		Title: "ESP Auto Flash",
		Mac: application.MacWindow{
			InvisibleTitleBarHeight: 38,
			Backdrop:                application.MacBackdropTranslucent,
			TitleBar:                application.MacTitleBarHiddenInset,
		},
		BackgroundColour: application.NewRGB(27, 38, 54),
		// 启用开发者工具，并允许通过常见快捷键直接打开调试面板。
		DevToolsEnabled:  true,
		KeyBindings: map[string]func(window application.Window){
			"F12": func(window application.Window) {
				window.OpenDevTools()
			},
			"Cmd+Option+I": func(window application.Window) {
				window.OpenDevTools()
			},
		},
		URL:              "/",
	})

	// 点击红绿灯关闭时不销毁窗口，而是转为隐藏到菜单栏。
	mainWindow.RegisterHook(events.Common.WindowClosing, func(e *application.WindowEvent) {
		e.Cancel()
		hideMainWindow(mainWindow)
	})

	// 当应用因系统重开事件被激活时，恢复主窗口并显示 Dock 图标。
	app.Event.OnApplicationEvent(events.Mac.ApplicationShouldHandleReopen, func(event *application.ApplicationEvent) {
		showMainWindow(mainWindow)
	})

	// 创建菜单栏图标，并通过右键菜单提供恢复窗口和退出能力。
	systemTray := app.SystemTray.New()
	if runtime.GOOS == "darwin" {
		systemTray.SetTemplateIcon(icons.SystrayMacTemplate)
	}

	trayMenu := app.NewMenu()
	trayMenu.Add("打开主窗口").OnClick(func(ctx *application.Context) {
		showMainWindow(mainWindow)
	})
	trayMenu.Add("退出").OnClick(func(ctx *application.Context) {
		app.Quit()
	})

	systemTray.SetMenu(trayMenu)
	systemTray.OnClick(func() {
		showMainWindow(mainWindow)
	})
	systemTray.OnRightClick(func() {
		systemTray.OpenMenu()
	})

	// Create a goroutine that emits an event containing the current time every second.
	// The frontend can listen to this event and update the UI accordingly.
	go func() {
		for {
			now := time.Now().Format(time.RFC1123)
			app.Event.Emit("time", now)
			time.Sleep(time.Second)
		}
	}()

	// Run the application. This blocks until the application has been exited.
	err := app.Run()

	// If an error occurred while running the application, log it and exit.
	if err != nil {
		log.Fatal(err)
	}
}
