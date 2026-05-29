'use client'
import { Download, Share2 } from 'lucide-react'

export function PubCvActions({ url, name }: { url: string; name: string }) {
  const share = () => {
    if (navigator.share) navigator.share({ url, title: `${name} · CV` })
    else navigator.clipboard?.writeText(url)
  }
  return (
    <div className="pub-cv-actions">
      <button className="pub-cv-pri" onClick={() => window.print()}>
        <Download size={15} strokeWidth={2} /> Download PDF
      </button>
      <button className="pub-cv-sec" onClick={share}>
        <Share2 size={15} strokeWidth={2} /> Share
      </button>
    </div>
  )
}
