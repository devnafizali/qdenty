import type { Metadata } from 'next'
import CvDemoSection from '@/components/marketing/cv-demo-section'
import '../../(app)/cv-builder/cv-builder.css'

export const metadata: Metadata = { title: 'CV Studio — qdenty' }

export default function CvStudioPage() {
  return (
    <section className="screen" id="cv">
      <CvDemoSection />
    </section>
  )
}
