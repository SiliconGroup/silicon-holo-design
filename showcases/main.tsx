import 'virtual:uno.css'
import '@/styles/base.css'
import '@/styles/animations.css'
import { createRoot } from 'react-dom/client'
import { ShowcaseApp } from './ShowcaseApp'

createRoot(document.getElementById('root')!).render(<ShowcaseApp />)
