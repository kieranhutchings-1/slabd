import { BrowserRouter, Routes, Route, useSearchParams } from 'react-router-dom'
import { Home } from './pages/Home'
import { SignIn } from './pages/SignIn'
import { Dashboard } from './pages/Dashboard'
import { Cards } from './pages/Cards'
import { Soon } from './pages/Soon'
import { Verify } from './pages/Verify'

/** The root path does double duty. A scanned QR arrives as `/?s=<serial>`
 *  and must show the verification page; everything else is the marketing
 *  homepage. Keeping verification on a query param rather than its own path
 *  means it resolves with a real 200 on static hosting, instead of relying
 *  on the SPA 404 fallback the way the other routes do. */
function Root() {
  const [params] = useSearchParams()
  const serial = params.get('s')
  return serial ? <Verify serial={serial} /> : <Home />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Root />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/vault" element={<Dashboard />} />
        <Route path="/vault/cards" element={<Cards />} />
        <Route path="/vault/wants" element={<Soon title="Want list" feature="Your want list" />} />
        <Route path="/vault/breaks" element={<Soon title="Breaks" feature="Break tracking" />} />
        <Route path="/vault/settings" element={<Soon title="Settings" feature="Settings" />} />
        <Route path="*" element={<Root />} />
      </Routes>
    </BrowserRouter>
  )
}
