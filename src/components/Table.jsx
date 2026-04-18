import { ChevronUp, ChevronDown, ChevronsUpDown, Pencil, Trash2, PackageOpen, MessageSquare } from 'lucide-react'

const COLS = [
  { key: 'artikelnummer', label: 'Artikel-Nr.' },
  { key: 'name',          label: 'Name' },
  { key: 'datumEinkauf',  label: 'Einkauf-Datum' },
  { key: 'datumVerkauf',  label: 'Verkauf-Datum' },
  { key: 'einkauf',       label: 'Einkauf (€)',  right: true },
  { key: 'verkauf',       label: 'Verkauf (€)',  right: true },
  { key: 'gewinn',        label: 'Gewinn (€)',   right: true },
  { key: 'status',        label: 'Status' },
  { key: 'notizen',       label: 'Notizen' },
]

const STATUS_STYLE = {
  'verfügbar':          'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  'verkauft':           'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
  'storniert':          'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  'rücksendung':        'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
  'rückerstattung':     'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400',
  'teilrückerstattung': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
}

const STATUS_LABEL = {
  'verfügbar':          'Verfügbar',
  'verkauft':           'Verkauft',
  'storniert':          'Storniert',
  'rücksendung':        'Rücksendung',
  'rückerstattung':     'Rückerstattung',
  'teilrückerstattung': 'Teilrückerstattung',
}

const fmtDate = val => {
  if (!val) return '—'
  const [y, m, d] = val.split('-')
  return `${d}.${m}.${y}`
}

const fmtEur = val => {
  const n = parseFloat(val)
  return isNaN(n)
    ? '—'
    : new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n)
}

function SortIcon({ colKey, sortConfig }) {
  if (sortConfig.key !== colKey) return <ChevronsUpDown size={12} className="text-gray-300 dark:text-gray-600 flex-shrink-0" />
  return sortConfig.direction === 'asc'
    ? <ChevronUp size={12} className="text-indigo-500 flex-shrink-0" />
    : <ChevronDown size={12} className="text-indigo-500 flex-shrink-0" />
}

export default function Table({ entries, sortConfig, onSort, onEdit, onDelete }) {
  // Totals for footer (only sold/relevant entries)
  const totalEinkauf = entries.reduce((s, e) => s + (e.einkauf || 0), 0)
  const soldEntries = entries.filter(e => e.status === 'verkauft')
  const totalVerkauf = soldEntries.reduce((s, e) => s + (e.verkauf || 0), 0)
  const totalGewinn = soldEntries.reduce((s, e) => s + (e.gewinn || 0), 0)

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800/80">
            {COLS.map(col => (
              <th
                key={col.key}
                onClick={() => col.key !== 'notizen' && onSort(col.key)}
                className={`px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide transition-colors whitespace-nowrap ${
                  col.key !== 'notizen' ? 'cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 select-none' : ''
                }`}
              >
                <div className={`flex items-center gap-1 ${col.right ? 'justify-end' : ''}`}>
                  {col.label}
                  {col.key !== 'notizen' && <SortIcon colKey={col.key} sortConfig={sortConfig} />}
                </div>
              </th>
            ))}
            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Aktionen
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.length === 0 ? (
            <tr>
              <td colSpan={10}>
                <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-600">
                  <PackageOpen size={40} className="mb-3 opacity-40" />
                  <p className="text-sm font-medium">Keine Einträge gefunden</p>
                  <p className="text-xs mt-1">Füge deinen ersten Artikel hinzu oder importiere eine Datei.</p>
                </div>
              </td>
            </tr>
          ) : (
            entries.map((entry, i) => {
              const showGewinn = entry.status !== 'verfügbar'
              const gewinnPos = parseFloat(entry.gewinn) >= 0

              return (
                <tr
                  key={entry.id}
                  className={`border-t border-gray-100 dark:border-gray-800 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition-colors ${
                    i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/60 dark:bg-gray-900/60'
                  }`}
                >
                  {/* Artikelnummer */}
                  <td className="px-3 py-2.5 font-mono text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                    {entry.artikelnummer || '—'}
                  </td>
                  {/* Name */}
                  <td className="px-3 py-2.5 font-medium text-gray-800 dark:text-gray-200 min-w-[200px]">
                    {entry.name || '—'}
                  </td>
                  {/* Datum Einkauf */}
                  <td className="px-3 py-2.5 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {fmtDate(entry.datumEinkauf)}
                  </td>
                  {/* Datum Verkauf */}
                  <td className="px-3 py-2.5 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {fmtDate(entry.datumVerkauf)}
                  </td>
                  {/* Einkauf */}
                  <td className="px-3 py-2.5 text-right text-gray-600 dark:text-gray-300 whitespace-nowrap">
                    {fmtEur(entry.einkauf)}
                  </td>
                  {/* Verkauf */}
                  <td className="px-3 py-2.5 text-right text-gray-600 dark:text-gray-300 whitespace-nowrap">
                    {entry.status === 'verfügbar'
                      ? <span className="text-gray-300 dark:text-gray-600">—</span>
                      : fmtEur(entry.verkauf)
                    }
                  </td>
                  {/* Gewinn */}
                  <td className={`px-3 py-2.5 text-right font-semibold whitespace-nowrap ${
                    !showGewinn
                      ? 'text-gray-300 dark:text-gray-600'
                      : gewinnPos
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-500 dark:text-red-400'
                  }`}>
                    {showGewinn ? fmtEur(entry.gewinn) : '—'}
                  </td>
                  {/* Status */}
                  <td className="px-3 py-2.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                      STATUS_STYLE[entry.status] || 'bg-gray-100 text-gray-600'
                    }`}>
                      {STATUS_LABEL[entry.status] || entry.status}
                    </span>
                  </td>
                  {/* Notizen */}
                  <td className="px-3 py-2.5 max-w-[160px]">
                    {entry.notizen ? (
                      <span
                        title={entry.notizen}
                        className="flex items-center gap-1 text-gray-500 dark:text-gray-400 cursor-help"
                      >
                        <MessageSquare size={13} className="flex-shrink-0 text-indigo-400" />
                        <span className="truncate text-xs">{entry.notizen}</span>
                      </span>
                    ) : (
                      <span className="text-gray-300 dark:text-gray-600 text-xs">—</span>
                    )}
                  </td>
                  {/* Aktionen */}
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEdit(entry)}
                        className="p-1.5 rounded-lg text-indigo-500 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                        title="Bearbeiten"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => onDelete(entry.id)}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                        title="Löschen"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
        {entries.length > 0 && (
          <tfoot>
            <tr className="border-t-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60">
              <td colSpan={4} className="px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Summe ({entries.length} {entries.length === 1 ? 'Eintrag' : 'Einträge'})
              </td>
              <td className="px-3 py-3 text-right text-sm font-bold text-red-500 dark:text-red-400 whitespace-nowrap">
                {fmtEur(-totalEinkauf)}
              </td>
              <td className="px-3 py-3 text-right text-sm font-bold text-gray-700 dark:text-gray-200 whitespace-nowrap">
                {fmtEur(totalVerkauf)}
              </td>
              <td className="px-3 py-3 text-right text-sm font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                {fmtEur(totalGewinn)}
              </td>
              <td colSpan={3} />
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  )
}
