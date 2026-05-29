import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default:  'qdenty — beautiful QR codes',
    template: '%s · qdenty',
  },
  description: 'Generate, manage, and track beautiful QR codes with precision.',
  robots: { index: false, follow: false },  // overridden per-page
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div id="root">
          {children}
        </div>
      </body>
    </html>
  )
}
