import { BrowserRouter, Routes, Route, useSearchParams } from 'react-router-dom'
import { Home } from './pages/Home'
import { SignIn } from './pages/SignIn'
import { Dashboard } from './pages/Dashboard'
import { Cards } from './pages/Cards'
import { CardDetail } from './pages/CardDetail'
import { CardForm } from './pages/CardForm'
import { Data } from './pages/Data'
import { Soon } from './pages/Soon'
import { Verify } from './pages/Verify'
import { Privacy } from './pages/Privacy'
import { Terms } from './pages/Terms'
import { ResetPassword } from './pages/ResetPassword'

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
        <Route path="/reset" element={<ResetPassword />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/vault" element={<Dashboard />} />
        <Route path="/vault/cards" element={<Cards />} />
        {/* `new` is declared before `:id` so it isn't captured as a card id. */}
        <Route path="/vault/cards/new" element={<CardForm />} />
        <Route path="/vault/cards/:id" element={<CardDetail />} />
        <Route path="/vault/cards/:id/edit" element={<CardForm />} />
        <Route path="/vault/data" element={<Data />} />
        <Route path="/vault/wants" element={<Soon title="Want list" feature="Your want list" />} />
        <Route path="/vault/breaks" element={<Soon title="Breaks" feature="Break tracking" />} />
        <Route path="/vault/settings" element={<Soon title="Settings" feature="Settings" />} />
        <Route path="*" element={<Root />} />
      </Routes>
    </BrowserRouter>
  )
}
