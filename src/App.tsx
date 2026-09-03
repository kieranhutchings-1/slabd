import { BrowserRouter, Routes, Route, useSearchParams } from 'react-router-dom'
import { Home } from './pages/Home'
import { SignIn } from './pages/SignIn'
import { Vault } from './pages/Vault'
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
        <Route path="/vault" element={<Vault />} />
        <Route path="*" element={<Root />} />
      </Routes>
    </BrowserRouter>
  )
}
