import { Sun, Moon, Plus, Upload, Download, FileSpreadsheet, Search, ShoppingBag, Trash2, X, Sparkles } from 'lucide-react'
import { COLORS, SIZES } from '../constants.js'

const STATUS_OPTIONS = [
  { value: 'all',               label: 'Alle Status' },
  { value: 'verfügbar',         label: 'Verfügbar' },
  { value: 'verkauft',          label: 'Verkauft' },
  { value: 'storniert',         label: 'Storniert' },
  { value: 'rücksendung',       label: 'Rücksendung' },
  { value: 'rückerstattung',    label: 'Rückerstattung' },
  { value: 'teilrückerstattung',label: 'Teilrückerstattung' },
]

const selectCls = 'px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white cursor-pointer'

export default function Header({
  darkMode, onToggleDark,
  searchQuery, onSearch,
  statusFilter, onFilterChange,
  groesseFilter, onGroesseChange,
  farbenFilter, onFarbenChange,
  onAdd, onImport, onExportCSV, onExportExcel,
  onAutoExtract, totalCount,
  onLogout,
}) {
  const activeFilters = [statusFilter !== 'all', groesseFilter !== 'all', farbenFilter !== 'all'].filter(Boolean).length

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm sticky top-0 z-10">
      <div className="max-w-screen-2xl mx-auto px-6 py-3">
        {/* Title row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-md">
              <ShoppingBag size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                Vinted Buchhaltung
              </h1>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {totalCount} {totalCount === 1 ? 'Artikel' : 'Artikel'} gesamt
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleDark}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
              title={darkMode ? 'Light Mode aktivieren' : 'Dark Mode aktivieren'}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={onLogout}
              className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors border border-gray-200 dark:border-gray-700"
            >
              Abmelden
            </button>
          </div>
        </div>

        {/* Search + filters row */}
        <div className="flex flex-wrap gap-2 items-center mb-2">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Name, Artikelnummer oder Notiz suchen…"
              value={searchQuery}
              onChange={e => onSearch(e.target.value)}
              className="w-full pl-8 pr-8 py-2 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
            {searchQuery && (
              <button
                onClick={() => onSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={e => onFilterChange(e.target.value)}
            className={selectCls + (statusFilter !== 'all' ? ' ring-2 ring-indigo-400' : '')}
          >
            {STATUS_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* Größe filter */}
          <select
            value={groesseFilter}
            onChange={e => onGroesseChange(e.target.value)}
            className={selectCls + (groesseFilter !== 'all' ? ' ring-2 ring-indigo-400' : '')}
          >
            <option value="all">Alle Größen</option>
            {SIZES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Farbe filter */}
          <select
            value={farbenFilter}
            onChange={e => onFarbenChange(e.target.value)}
            className={selectCls + (farbenFilter !== 'all' ? ' ring-2 ring-indigo-400' : '')}
          >
            <option value="all">Alle Farben</option>
            {COLORS.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>

          {activeFilters > 0 && (
            <button
              onClick={() => { onFilterChange('all'); onGroesseChange('all'); onFarbenChange('all') }}
              className="flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-lg border border-indigo-200 dark:border-indigo-800 transition-colors"
              title="Alle Filter zurücksetzen"
            >
              <X size={12} />
              Filter ({activeFilters})
            </button>
          )}
        </div>

        {/* Actions row */}
        <div className="flex flex-wrap gap-2 items-center">
          {/* Add */}
          <button
            onClick={onAdd}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-lg transition-colors shadow-sm"
          >
            <Plus size={15} />
            Hinzufügen
          </button>

          {/* Import */}
          <button
            onClick={onImport}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg transition-colors border border-gray-200 dark:border-gray-700"
            title="Excel / CSV importieren"
          >
            <Upload size={15} />
            <span className="hidden sm:inline">Import</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={onExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg transition-colors border border-gray-200 dark:border-gray-700"
            title="Als CSV exportieren"
          >
            <Download size={15} />
            <span className="hidden sm:inline">CSV</span>
          </button>

          {/* Export Excel */}
          <button
            onClick={onExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-400 rounded-lg transition-colors border border-emerald-200 dark:border-emerald-800"
            title="Als Excel-Datei exportieren"
          >
            <FileSpreadsheet size={15} />
            <span className="hidden sm:inline">Excel</span>
          </button>

          {/* Auto-extract */}
          <button
            onClick={onAutoExtract}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-violet-50 dark:bg-violet-950 hover:bg-violet-100 dark:hover:bg-violet-900 text-violet-700 dark:text-violet-400 rounded-lg transition-colors border border-violet-200 dark:border-violet-800"
            title="Größe und Farbe automatisch aus Artikelname erkennen"
          >
            <Sparkles size={15} />
            <span className="hidden sm:inline">Auto-Erkennung</span>
          </button>

        </div>
      </div>
    </header>
  )
}
