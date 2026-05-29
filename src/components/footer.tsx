import Link from 'next/link'

function IconX() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.735-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function IconGitHub() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  )
}

function IconLinkedIn() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function IconProductHunt() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
      <path d="M13.604 8.4h-3.405V12H13.604a1.8 1.8 0 0 0 0-3.6zM12 0C5.373 0 0 5.372 0 12c0 6.627 5.373 12 12 12 6.628 0 12-5.373 12-12 0-6.628-5.372-12-12-12zm1.604 14.4h-3.405V18H7.8V6h5.804a4.2 4.2 0 0 1 0 8.4z" />
    </svg>
  )
}

export default function Footer() {
  return (
    <footer className="site-footer">
      {/* ── Top bar ── */}
      <div className="ft-top">
        <div className="ft-brand">
          <div className="ft-logo">qdenty<span className="it">.</span></div>
          <p className="ft-desc">
            Beautiful dynamic QR codes with built-in analytics, identity pages, and a CV studio. For creators, professionals, and teams.
          </p>
          <div className="ft-socials">
            <a href="#" aria-label="Twitter / X" className="ft-social"><IconX /></a>
            <a href="#" aria-label="GitHub" className="ft-social"><IconGitHub /></a>
            <a href="#" aria-label="LinkedIn" className="ft-social"><IconLinkedIn /></a>
            <a href="#" aria-label="Product Hunt" className="ft-social"><IconProductHunt /></a>
          </div>
        </div>

        <div className="ft-cols">
          <div className="ft-col">
            <h5>Product</h5>
            <ul>
              <li><Link href="/builder">QR Generator</Link></li>
              <li><Link href="/templates">Templates</Link></li>
              <li><Link href="/cv">CV Studio</Link></li>
              <li><Link href="/identity">Identity Page</Link></li>
              <li><Link href="/account/api">API Access</Link></li>
              <li><Link href="/analytics">Analytics</Link></li>
            </ul>
          </div>

          <div className="ft-col">
            <h5>Plans</h5>
            <ul>
              <li><Link href="/pricing">Guest (Free)</Link></li>
              <li><Link href="/pricing">Free Account</Link></li>
              <li><Link href="/pricing">Starter</Link></li>
              <li><Link href="/pricing">Professional</Link></li>
              <li><Link href="/pricing">Atelier</Link></li>
              <li><Link href="/pricing">Enterprise</Link></li>
            </ul>
          </div>

          <div className="ft-col">
            <h5>Resources</h5>
            <ul>
              <li><Link href="#">Documentation</Link></li>
              <li><Link href="#">API Reference</Link></li>
              <li><Link href="/templates">Use Cases</Link></li>
              <li><Link href="#">Changelog</Link></li>
              <li><Link href="#">Status</Link></li>
              <li><Link href="#">Brand Kit</Link></li>
            </ul>
          </div>

          <div className="ft-col">
            <h5>Company</h5>
            <ul>
              <li><Link href="#">About</Link></li>
              <li><Link href="#">Manifesto</Link></li>
              <li><Link href="#">Privacy Policy</Link></li>
              <li><Link href="#">Terms of Service</Link></li>
              <li><Link href="#">Contact</Link></li>
              <li><Link href="#">Press Kit</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="ft-bottom">
        <div className="ft-bottom-left">
          <span>© 2026 Mabous Innovations &amp; Engineering Ltd.</span>
          <span className="ft-sep">·</span>
          <Link href="#">Privacy</Link>
          <span className="ft-sep">·</span>
          <Link href="#">Terms</Link>
          <span className="ft-sep">·</span>
          <Link href="#">Cookies</Link>
        </div>
        <div className="ft-bottom-right">
          <span className="ft-offices">Dhaka · Lisbon · Singapore</span>
          <span className="ft-sep">·</span>
          <span>v1.2.0</span>
        </div>
      </div>
    </footer>
  )
}
