export default function StyleIcon({ id }: { id: string }) {
  if (id === 'square') return (
    <svg viewBox="0 0 32 32" aria-hidden="true"><g fill="currentColor">
      {[0,1,2,4,6,7].map(c => <rect key={'a'+c} x={c*4} y={0}  width="3" height="3"/>)}
      {[0,2,3,5,7].map(c =>   <rect key={'b'+c} x={c*4} y={4}  width="3" height="3"/>)}
      {[1,2,4,6].map(c =>     <rect key={'c'+c} x={c*4} y={8}  width="3" height="3"/>)}
      {[0,3,5,7].map(c =>     <rect key={'d'+c} x={c*4} y={12} width="3" height="3"/>)}
      {[1,2,4,6,7].map(c =>   <rect key={'e'+c} x={c*4} y={16} width="3" height="3"/>)}
      {[0,2,5,7].map(c =>     <rect key={'f'+c} x={c*4} y={20} width="3" height="3"/>)}
      {[0,1,3,4,6].map(c =>   <rect key={'g'+c} x={c*4} y={24} width="3" height="3"/>)}
      {[0,2,3,5,7].map(c =>   <rect key={'h'+c} x={c*4} y={28} width="3" height="3"/>)}
    </g></svg>
  )
  if (id === 'rounded') return (
    <svg viewBox="0 0 32 32" aria-hidden="true"><g fill="currentColor">
      {Array.from({ length: 7 }).flatMap((_, r) =>
        Array.from({ length: 7 }).map((__, c) =>
          (r * 11 + c * 5) % 2
            ? <rect key={`${r}-${c}`} x={1 + c * 4.5} y={1 + r * 4.5} width="3.2" height="3.2" rx="1.2"/>
            : null
        )
      )}
    </g></svg>
  )
  if (id === 'dot') return (
    <svg viewBox="0 0 32 32" aria-hidden="true"><g fill="currentColor">
      {Array.from({ length: 7 }).flatMap((_, r) =>
        Array.from({ length: 7 }).map((__, c) =>
          (r * 13 + c * 7) % 3
            ? <circle key={`${r}-${c}`} cx={2 + c * 4.5} cy={2 + r * 4.5} r="1.8"/>
            : null
        )
      )}
    </g></svg>
  )
  if (id === 'cross') return (
    <svg viewBox="0 0 32 32" aria-hidden="true"><g fill="currentColor">
      {Array.from({ length: 6 }).flatMap((_, r) =>
        Array.from({ length: 6 }).map((__, c) =>
          (r * 9 + c * 7) % 3 ? (
            <g key={`${r}-${c}`} transform={`translate(${2 + c * 5},${2 + r * 5})`}>
              <rect x="1.4" y="0" width="0.8" height="3.6"/>
              <rect x="0" y="1.4" width="3.6" height="0.8"/>
            </g>
          ) : null
        )
      )}
    </g></svg>
  )
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="10" fill="none" stroke="currentColor" strokeOpacity="0.4" strokeDasharray="2 2"/>
    </svg>
  )
}
