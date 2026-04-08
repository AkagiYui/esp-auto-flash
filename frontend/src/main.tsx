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
  const rootElement = getRootElement()

  if (!rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement)
    root.render(<RouterProvider router={router} />)
  }
}

void bootstrap()