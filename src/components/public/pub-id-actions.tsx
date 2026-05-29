'use client'
import { UserPlus, Share2 } from 'lucide-react'

export function VCardButton({ name, email, phone, slug, label }: {
  name: string; email: string; phone: string; slug: string; label?: string
}) {
  const save = () => {
    const vcf = [
      'BEGIN:VCARD', 'VERSION:3.0',
      `FN:${name}`,
      `EMAIL:${email}`,
      phone ? `TEL:${phone}` : '',
      `URL:https://qdenty.io/u/${slug}`,
      'END:VCARD',
    ].filter(Boolean).join('\n')
    const blob = new Blob([vcf], { type: 'text/vcard' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${name.replace(/\s+/g, '-').toLowerCase()}.vcf`
    a.click()
    URL.revokeObjectURL(a.href)
  }
  return (
    <button onClick={save}>
      <UserPlus size={15} strokeWidth={2} />
      {label ?? 'Save to Contacts'}
    </button>
  )
}

export function ShareQuickItem({ url, name, label }: { url: string; name: string; label?: string }) {
  const handle = () => {
    if (navigator.share) navigator.share({ url, title: name })
    else navigator.clipboard?.writeText(url)
  }

  if (label) {
    return (
      <button onClick={handle}>
        <Share2 size={15} strokeWidth={2} />
        {label}
      </button>
    )
  }

  return (
    <a
      className="pub-id-quick-i"
      style={{ cursor: 'pointer' }}
      onClick={handle}
    >
      <div className="qi-glyph"><Share2 size={18} strokeWidth={2} /></div>
      <div className="qi-l">Share</div>
    </a>
  )
}
