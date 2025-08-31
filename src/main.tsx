
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Basic GA4 route view tracking
function trackPageView() {
  const path = window.location.pathname + window.location.search
  // @ts-ignore
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    // @ts-ignore
    window.gtag('event', 'page_view', {
      page_path: path,
    })
  }
}

window.addEventListener('popstate', trackPageView)
window.addEventListener('hashchange', trackPageView)

// Remove dark mode class addition
createRoot(document.getElementById("root")!).render(<App />);

// initial view
trackPageView()
