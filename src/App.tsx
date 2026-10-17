import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { CaseDetail } from './pages/CaseDetail'
import { Cases } from './pages/Cases'
import { DesignerDetail } from './pages/DesignerDetail'
import { Designers } from './pages/Designers'
import { Home } from './pages/Home'
import { Progress } from './pages/Progress'
import { Quote } from './pages/Quote'

const Hud = lazy(() => import('./pages/Hud').then((m) => ({ default: m.Hud })))
const Sandbox = lazy(() => import('./pages/Sandbox').then((m) => ({ default: m.Sandbox })))
const Galaxy = lazy(() => import('./pages/Galaxy').then((m) => ({ default: m.Galaxy })))

function ImmersiveFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b1016] font-mono text-sm text-teal-bright/70">
      载入沉浸式界面…
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="hud"
          element={
            <Suspense fallback={<ImmersiveFallback />}>
              <Hud />
            </Suspense>
          }
        />
        <Route
          path="sandbox"
          element={
            <Suspense fallback={<ImmersiveFallback />}>
              <Sandbox />
            </Suspense>
          }
        />
        <Route
          path="galaxy"
          element={
            <Suspense fallback={<ImmersiveFallback />}>
              <Galaxy />
            </Suspense>
          }
        />
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="cases" element={<Cases />} />
          <Route path="cases/:id" element={<CaseDetail />} />
          <Route path="designers" element={<Designers />} />
          <Route path="designers/:id" element={<DesignerDetail />} />
          <Route path="progress" element={<Progress />} />
          <Route path="quote" element={<Quote />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
