'use client'

import { useEffect, useRef } from 'react'

interface Props {
  value: string
  size?: number
  color?: string
  bg?: string
  className?: string
  style?: React.CSSProperties
}

export default function MarketingQr({ value, size = 120, color = '#0f0e0c', bg = '#f3efe7', className, style }: Props) {
  const ref = useRef<SVGSVGElement>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const QRCode = (await import('qrcode')).default
      const qr = QRCode.create(value || 'https://qdenty.io', { errorCorrectionLevel: 'M' })
      const { data, size: n } = qr.modules as { data: Uint8Array; size: number }
      if (cancelled || !ref.current) return
      const svg = ref.current
      svg.setAttribute('viewBox', `0 0 ${n} ${n}`)
      while (svg.firstChild) svg.removeChild(svg.firstChild)
      if (bg && bg !== 'transparent') {
        const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
        bgRect.setAttribute('width', String(n))
        bgRect.setAttribute('height', String(n))
        bgRect.setAttribute('fill', bg)
        svg.appendChild(bgRect)
      }
      for (let i = 0; i < n * n; i++) {
        if (!data[i]) continue
        const x = i % n
        const y = Math.floor(i / n)
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
        rect.setAttribute('x', String(x))
        rect.setAttribute('y', String(y))
        rect.setAttribute('width', '1')
        rect.setAttribute('height', '1')
        rect.setAttribute('fill', color)
        svg.appendChild(rect)
      }
    })()
    return () => { cancelled = true }
  }, [value, color, bg])

  return (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 21 21"
      className={className}
      style={style}
    />
  )
}
