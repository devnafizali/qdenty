'use client'
import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react'

export interface QrPreviewHandle {
  download: (format: 'png' | 'jpg' | 'svg', filename: string) => void
}

interface Props {
  payload: string
  qrStyle: 'square' | 'rounded' | 'dot' | 'cross' | 'organic'
  color:   string
  bg?:     string
}

type QRModule = boolean

function buildSvgModules(
  data: QRModule[],
  size: number,
  qrStyle: string,
  color: string,
  bg: string,
  cellPx: number,
): string {
  const pad = 2 * cellPx
  const total = size * cellPx + 2 * pad

  const shapes: string[] = []

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!data[r * size + c]) continue

      const x = pad + c * cellPx
      const y = pad + r * cellPx
      const s = cellPx - 0.8

      if (qrStyle === 'dot') {
        const cx = x + cellPx / 2
        const cy = y + cellPx / 2
        shapes.push(`<circle cx="${cx}" cy="${cy}" r="${s / 2}"/>`)
      } else if (qrStyle === 'rounded') {
        const rx = s * 0.35
        shapes.push(`<rect x="${x + 0.4}" y="${y + 0.4}" width="${s}" height="${s}" rx="${rx}"/>`)
      } else if (qrStyle === 'cross') {
        const arm = s * 0.28
        const bar = s * 0.55
        const cx  = x + cellPx / 2
        const cy  = y + cellPx / 2
        shapes.push(
          `<rect x="${cx - arm / 2}" y="${cy - bar / 2}" width="${arm}" height="${bar}"/>`,
          `<rect x="${cx - bar / 2}" y="${cy - arm / 2}" width="${bar}" height="${arm}"/>`,
        )
      } else {
        shapes.push(`<rect x="${x + 0.4}" y="${y + 0.4}" width="${s}" height="${s}"/>`)
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" width="${total}" height="${total}">
  <rect width="${total}" height="${total}" fill="${bg}"/>
  <g fill="${color}">${shapes.join('')}</g>
</svg>`
}

const QrPreview = forwardRef<QrPreviewHandle, Props>(
  ({ payload, qrStyle, color, bg = '#f3efe7' }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const svgStringRef = useRef<string>('')

    const render = useCallback(async () => {
      if (!containerRef.current || !payload) return
      try {
        const QRCode = (await import('qrcode')).default
        const qr = QRCode.create(payload, { errorCorrectionLevel: 'M' })
        const { data, size } = qr.modules as { data: Uint8Array; size: number }
        const boolData: QRModule[] = Array.from(data).map(Boolean)
        const svg = buildSvgModules(boolData, size, qrStyle, color, bg, 10)
        svgStringRef.current = svg
        containerRef.current.innerHTML = svg
      } catch {
        if (containerRef.current) {
          containerRef.current.innerHTML = '<p style="font-family:var(--mono);font-size:11px;color:var(--ink-mute);padding:20px">Invalid payload</p>'
        }
      }
    }, [payload, qrStyle, color, bg])

    useEffect(() => { render() }, [render])

    useImperativeHandle(ref, () => ({
      download: (format, filename) => {
        if (format === 'svg') {
          const blob = new Blob([svgStringRef.current], { type: 'image/svg+xml' })
          const url  = URL.createObjectURL(blob)
          const a    = document.createElement('a')
          a.href     = url
          a.download = `${filename}.svg`
          a.click()
          URL.revokeObjectURL(url)
          return
        }

        const svgEl = containerRef.current?.querySelector('svg')
        if (!svgEl) return

        const w     = 1200
        const h     = 1200
        const canvas = document.createElement('canvas')
        canvas.width  = w
        canvas.height = h
        const ctx = canvas.getContext('2d')!
        const img = new Image()
        const serialized = new XMLSerializer().serializeToString(svgEl)
        const blob = new Blob([serialized], { type: 'image/svg+xml' })
        const url  = URL.createObjectURL(blob)
        img.onload = () => {
          ctx.drawImage(img, 0, 0, w, h)
          URL.revokeObjectURL(url)
          const a = document.createElement('a')
          a.download = `${filename}.${format === 'jpg' ? 'jpg' : 'png'}`
          a.href     = canvas.toDataURL(format === 'jpg' ? 'image/jpeg' : 'image/png', 0.95)
          a.click()
        }
        img.src = url
      },
    }))

    return (
      <div
        ref={containerRef}
        className="qr-frame"
        style={{ lineHeight: 0 }}
        aria-label="QR code preview"
      />
    )
  },
)

QrPreview.displayName = 'QrPreview'
export default QrPreview
