import TemplateGrid from '@/components/marketing/template-grid'

export const metadata = { title: 'Templates — qdenty' }

export default function TemplatesPage() {
  return (
    <section className="screen" id="templates">
      <div className="uc-head">
        <h2>A QR for <span className="it">every</span> intention.</h2>
        <div className="uc-intro">
          <span className="lbl">Research-backed use cases · 2026</span>
          From the boardroom to the bookshelf — pick a template, fill in the details, and walk away with a code that does the work. Free tier covers the essentials; Pro and Atelier unlock dynamic codes, analytics, and team controls.
        </div>
      </div>
      <TemplateGrid />
    </section>
  )
}
