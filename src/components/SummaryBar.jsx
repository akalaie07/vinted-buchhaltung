const fmt = val =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(val || 0)

const TAX_LIMIT = 25000

function Card({ label, value, sub, color }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 px-4 py-3 flex-1 min-w-[130px]">
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 truncate">{label}</p>
      <p className={`text-xl font-bold leading-tight ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
    </div>
  )
}

export default function SummaryBar({ entries, total }) {
  const sold    = entries.filter(e => e.status === 'verkauft')
  const avail   = entries.filter(e => e.status === 'verfügbar')
  const returns = entries.filter(e => ['rücksendung', 'rückerstattung', 'teilrückerstattung'].includes(e.status))

  const totalEinkauf  = entries.reduce((s, e) => s + (e.einkauf || 0), 0)
  const totalVerkauf  = sold.reduce((s, e) => s + (e.verkauf || 0), 0)
  const totalGewinn   = sold.reduce((s, e) => s + (e.gewinn || 0), 0)
  const stockValue    = avail.reduce((s, e) => s + (e.einkauf || 0), 0)

  const currentYear = new Date().getFullYear()
  const yearRevenue = sold
    .filter(e => e.datumVerkauf && e.datumVerkauf.startsWith(String(currentYear)))
    .reduce((s, e) => s + (e.verkauf || 0), 0)
  const pct = Math.min(100, (yearRevenue / TAX_LIMIT) * 100)
  const remaining = Math.max(0, TAX_LIMIT - yearRevenue)
  const taxColor = pct >= 90 ? 'text-red-500 dark:text-red-400' : pct >= 70 ? 'text-amber-500 dark:text-amber-400' : 'text-gray-800 dark:text-gray-100'
  const barColor = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-emerald-500'

  const gewinnColor = totalGewinn >= 0
    ? 'text-emerald-600 dark:text-emerald-400'
    : 'text-red-600 dark:text-red-400'

  return (
    <div className="flex flex-wrap gap-3 mb-5">
      <Card
        label="Einträge"
        value={entries.length}
        sub={total !== entries.length ? `von ${total} gesamt` : undefined}
        color="text-gray-800 dark:text-gray-100"
      />
      <Card
        label="Verkauft"
        value={sold.length}
        sub={`Einnahmen: ${fmt(totalVerkauf)}`}
        color="text-emerald-600 dark:text-emerald-400"
      />
      <Card
        label="Verfügbar"
        value={avail.length}
        sub={`Lagerwert: ${fmt(stockValue)}`}
        color="text-blue-600 dark:text-blue-400"
      />
      {returns.length > 0 && (
        <Card
          label="Retouren / Erstattungen"
          value={returns.length}
          color="text-orange-500 dark:text-orange-400"
        />
      )}
      <Card
        label="Gesamtgewinn"
        value={fmt(totalGewinn)}
        sub={`Gesamteinkauf: ${fmt(totalEinkauf)}`}
        color={gewinnColor}
      />
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 px-4 py-3 flex-1 min-w-[200px]">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Einnahmen {currentYear} (Steuer)</p>
        <p className={`text-xl font-bold leading-tight ${taxColor}`}>{fmt(yearRevenue)}</p>
        <div className="mt-1.5 h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
          <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
          {remaining > 0
            ? `Noch ${fmt(remaining)} bis Kleinunternehmergrenze`
            : '⚠ Kleinunternehmergrenze überschritten!'}
        </p>
      </div>
    </div>
  )
}
