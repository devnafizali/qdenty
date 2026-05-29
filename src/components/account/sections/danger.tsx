'use client'
import { useTransition }  from 'react'
import { deleteAccount }  from '@/app/actions/account'
import { archiveAllCodes } from '@/app/actions/codes'
import { showToast }      from '@/components/toast'
import type { UserData }  from '../account-layout'

export default function DangerSection({ user }: { user: UserData }) {
  const [pending, start] = useTransition()

  const handleExport = () => {
    const data = JSON.stringify({ user, exportedAt: new Date().toISOString() }, null, 2)
    const blob  = new Blob([data], { type: 'application/json' })
    const url   = URL.createObjectURL(blob)
    const a     = document.createElement('a')
    a.href      = url
    a.download  = `qdenty-export-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Account data exported')
  }

  const handleArchive = () => {
    if (!confirm('Set all your codes to expired? Scanners will see an expired page. Reversible.')) return
    start(async () => {
      await archiveAllCodes()
      showToast('All codes archived')
    })
  }

  const handleDelete = () => {
    if (!confirm('Delete your account permanently? All codes and analytics will be deleted. This cannot be undone.')) return
    const confirm2 = window.prompt('Type DELETE in capitals to confirm')
    if (confirm2 !== 'DELETE') { showToast('Cancelled'); return }
    start(async () => {
      await deleteAccount()
    })
  }

  return (
    <>
      <div className="acct-section-head">
        <h2 className="acct-h2">Danger <span className="it">zone.</span></h2>
        <p className="acct-sub-p">Things that are permanent. Be careful.</p>
      </div>

      <div className="acct-danger-row">
        <div>
          <div className="acct-card-h">Export your data</div>
          <p className="acct-card-p">Download everything we have on you as JSON — GDPR / DSAR compliant.</p>
        </div>
        <button className="btn-mini-ghost" onClick={handleExport}>Export JSON</button>
      </div>

      <div className="acct-danger-row">
        <div>
          <div className="acct-card-h">Archive all codes</div>
          <p className="acct-card-p">Set every code to "expired". Reversible within 30 days via the dashboard.</p>
        </div>
        <button className="btn-mini-ghost" onClick={handleArchive} disabled={pending}>Archive all</button>
      </div>

      <div className="acct-danger-row danger">
        <div>
          <div className="acct-card-h danger">Delete account</div>
          <p className="acct-card-p">Permanently delete your account, all codes, and analytics. You can't undo this.</p>
        </div>
        <button className="btn-mini danger" onClick={handleDelete} disabled={pending}>
          {pending ? 'Deleting…' : 'Delete account'}
        </button>
      </div>
    </>
  )
}
