'use client'
import { useEffect, useRef } from 'react'
import type { CvData } from '@/db/schema'
import CvDocLive from './cv-doc-live'

// A4 at 96 dpi: 794 × 1123 px  (210mm × 297mm)
const DOC_W = 794
const A4_RATIO = 297 / 210   // height / width ≈ 1.414

export default function ScaledCvDoc({ cv, cvUrl }: { cv: CvData; cvUrl: string }) {
  const outerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function fit() {
      const outer = outerRef.current
      const inner = innerRef.current
      if (!outer || !inner) return

      const containerW = outer.offsetWidth
      if (containerW <= 0) return

      // force layout at the canonical CV width so offsetHeight is correct
      inner.style.width = `${DOC_W}px`
      // offsetHeight is NOT affected by CSS transforms — returns natural (pre-scale) height
      const naturalH = inner.offsetHeight

      const s = containerW / DOC_W

      if (s < 1) {
        inner.style.transform = `scale(${s})`
        // outer must be set explicitly — scaled element still occupies
        // its pre-scale layout box otherwise
        outer.style.height = `${Math.ceil(naturalH * s)}px`
      } else {
        inner.style.transform = 'none'
        outer.style.height = `${naturalH}px`
      }

      // remove aspectRatio now that we have an explicit height — prevents conflict
      outer.style.aspectRatio = 'unset'

      // reveal after correct scale is applied — no transition so there's no animation
      inner.style.opacity = '1'
    }

    fit()
    const ro = new ResizeObserver(fit)
    const el = outerRef.current
    if (el) ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div
      ref={outerRef}
      style={{
        overflow: 'hidden',
        // A4 aspect-ratio is the initial height hint before JS runs.
        // fit() clears it via outer.style.aspectRatio = 'unset' once explicit
        // height is set, so there is no conflict between the two.
        aspectRatio: `${1} / ${A4_RATIO}`,
      }}
    >
      <div
        ref={innerRef}
        style={{
          transformOrigin: 'top left',
          opacity: 0,
        }}
      >
        <CvDocLive cv={cv} cvUrl={cvUrl} template={cv.template} />
      </div>
    </div>
  )
}
