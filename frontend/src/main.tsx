import ReactDOM from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'

import { getRouter } from './router'

const router = getRouter()
function getRootElement() {
  const rootElement = document.getElementById('app')

  if (rootElement === null) {
    throw new Error('App root element not found')
  }

  return rootElement
}

async function bootstrap() {
  // 开发态提前加载 jotai-devtools，确保默认 store 在首次创建时就带上调试钩子。
  if (import.meta.env.DEV) {
    await import('jotai-devtools')
  }

  const rootElement = getRootElement()

  if (!rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement)
    root.render(<RouterProvider router={router} />)
  }
}

void bootstrap()