import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { SIZES, COLORS } from '../constants.js'

const STATUS_OPTIONS = [
  { value: 'verfügbar',          label: 'Verfügbar' },
  { value: 'verkauft',           label: 'Verkauft' },
  { value: 'storniert',          label: 'Storniert' },
  { value: 'rücksendung',        label: 'Rücksendung' },
  { value: 'rückerstattung',     label: 'Rückerstattung' },
  { value: 'teilrückerstattung', label: 'Teilrückerstattung' },
]

const fmtEur = val => {
  const n = parseFloat(val)
  return isNaN(n) ? '—' : new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n)
}

const BLANK = {
  artikelnummer: '',
  name: '',
  datumEinkauf: '',
  datumVerkauf: '',
  einkauf: '',
  verkauf: '',
  status: 'verfügbar',
  groesse: '',
  farben: [],
  notizen: '',
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls = 'w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-300 dark:placeholder-gray-600 transition-colors'

export default function EntryModal({ entry, onSave, onClose }) {
  const [form, setForm] = useState(() =>
    entry
      ? {
          artikelnummer: entry.artikelnummer || '',
          name: entry.name || '',
          datumEinkauf: entry.datumEinkauf || '',
          datumVerkauf: entry.datumVerkauf || '',
          einkauf: entry.einkauf !== undefined ? String(entry.einkauf) : '',
          verkauf: entry.verkauf !== undefined ? String(entry.verkauf) : '',
          status: entry.status || 'verfügbar',
          groesse: entry.groesse || '',
          farben: Array.isArray(entry.farben) ? entry.farben : [],
          notizen: entry.notizen || '',
        }
      : BLANK
  )

  const einkauf = parseFloat(form.einkauf) || 0
  const verkauf = parseFloat(form.verkauf) || 0
  const gewinn = verkauf - einkauf

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    onSave({
      ...form,
      einkauf: parseFloat(form.einkauf) || 0,
      verkauf: parseFloat(form.verkauf) || 0,
    })
  }

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const gewinnColor = form.status === 'verfügbar'
    ? 'text-gray-300 dark:text-gray-600'
    : gewinn >= 0
      ? 'text-emerald-600 dark:text-emerald-400'
      : 'text-red-500 dark:text-red-400'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-800 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex-shrink-0">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            {entry ? 'Eintrag bearbeiten' : 'Neuen Artikel hinzufügen'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form — scrollable */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 overflow-y-auto">
          {/* Row 1: Artikelnummer + Name */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Artikelnummer">
              <input
                type="text"
                value={form.artikelnummer}
                onChange={e => set('artikelnummer', e.target.value)}
                placeholder="VT-001"
                className={inputCls}
              />
            </Field>
            <Field label="Name" required>
              <input
                type="text"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="Artikelname"
                required
                className={inputCls}
              />
            </Field>
          </div>

          {/* Row 2: Dates */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Datum Einkauf">
              <input
                type="date"
                value={form.datumEinkauf}
                onChange={e => set('datumEinkauf', e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Datum Verkauf">
              <input
                type="date"
                value={form.datumVerkauf}
                onChange={e => set('datumVerkauf', e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>

          {/* Row 3: Prices */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Einkaufspreis (€)">
              <input
                type="number"
                value={form.einkauf}
                onChange={e => set('einkauf', e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className={inputCls}
              />
            </Field>
            <Field label="Verkaufspreis (€)">
              <input
                type="number"
                value={form.verkauf}
                onChange={e => set('verkauf', e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className={inputCls}
              />
            </Field>
          </div>

          {/* Status */}
          <Field label="Status">
            <select
              value={form.status}
              onChange={e => set('status', e.target.value)}
              className={inputCls + ' cursor-pointer'}
            >
              {STATUS_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>

          {/* Größe */}
          <Field label="Größe">
            <div className="flex flex-wrap gap-2">
              {SIZES.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => set('groesse', form.groesse === s ? '' : s)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                    form.groesse === s
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-indigo-400'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </Field>

          {/* Farben */}
          <Field label="Farbe">
            <div className="flex flex-wrap gap-2">
              {COLORS.map(c => {
                const selected = form.farben.includes(c.value)
                return (
                  <button
                    key={c.value}
                    type="button"
                    title={c.label}
                    onClick={() =>
                      set('farben', selected
                        ? form.farben.filter(v => v !== c.value)
                        : [...form.farben, c.value]
                      )
                    }
                    className={`w-7 h-7 rounded-full transition-all flex items-center justify-center flex-shrink-0 ${
                      c.border ? 'border-2 border-gray-300 dark:border-gray-600' : ''
                    } ${
                      selected
                        ? 'ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-gray-900 scale-110'
                        : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  >
                    {selected && (
                      <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none"
                        stroke={c.value === 'weiss' ? '#555' : 'white'}
                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      >
                        <polyline points="2,6 5,9 10,3" />
                      </svg>
                    )}
                  </button>
                )
              })}
            </div>
          </Field>

          {/* Notizen */}
          <Field label="Notizen">
            <textarea
              value={form.notizen}
              onChange={e => set('notizen', e.target.value)}
              placeholder="Optionale Anmerkungen zum Artikel…"
              rows={3}
              className={inputCls + ' resize-none'}
            />
          </Field>

          {/* Calculated summary */}
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-1">
              Gewinn (berechnet: Verkauf − Einkauf)
            </p>
            <p className={`text-2xl font-bold ${gewinnColor}`}>
              {fmtEur(gewinn)}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-lg transition-colors shadow-sm"
            >
              {entry ? 'Speichern' : 'Hinzufügen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
