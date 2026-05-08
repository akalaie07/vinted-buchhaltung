import { useState, useEffect, useMemo, useRef } from 'react'
import * as XLSX from 'xlsx'
import { supabase } from './supabase.js'
import { extractSizeAndColors } from './utils.js'
import Header from './components/Header.jsx'
import Table from './components/Table.jsx'
import EntryModal from './components/EntryModal.jsx'
import SummaryBar from './components/SummaryBar.jsx'
import LoginScreen from './components/LoginScreen.jsx'

const VALID_STATUSES = new Set(['verfügbar', 'verkauft', 'storniert', 'rücksendung', 'rückerstattung', 'teilrückerstattung'])

function normalizeStatus(raw) {
  const s = String(raw || '').trim().toLowerCase()
  if (s === 'lagernd') return 'verfügbar'
  if (VALID_STATUSES.has(s)) return s
  return 'verfügbar'
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

function processEntry(entry) {
  const einkauf = Math.abs(parseFloat(entry.einkauf) || 0)
  const verkauf = parseFloat(entry.verkauf) || 0
  const status = normalizeStatus(entry.status)
  return {
    ...entry,
    einkauf,
    verkauf,
    gewinn: verkauf === 0 ? 0 : verkauf - einkauf,
    status,
    groesse: entry.groesse || '',
    farben: Array.isArray(entry.farben) ? entry.farben : [],
    notizen: entry.notizen || '',
  }
}

function toDb(entry) {
  return {
    id: entry.id,
    artikelnummer: entry.artikelnummer || '',
    name: entry.name || '',
    datum_einkauf: entry.datumEinkauf || null,
    datum_verkauf: entry.datumVerkauf || null,
    einkauf: entry.einkauf || 0,
    verkauf: entry.verkauf || 0,
    gewinn: entry.gewinn || 0,
    status: entry.status || 'verfügbar',
    groesse: entry.groesse || '',
    farben: Array.isArray(entry.farben) ? entry.farben.join(',') : '',
    notizen: entry.notizen || '',
  }
}

function fromDb(row) {
  return processEntry({
    id: row.id,
    artikelnummer: row.artikelnummer,
    name: row.name,
    datumEinkauf: row.datum_einkauf || '',
    datumVerkauf: row.datum_verkauf || '',
    einkauf: row.einkauf,
    verkauf: row.verkauf,
    status: row.status,
    groesse: row.groesse || '',
    farben: row.farben ? row.farben.split(',').filter(Boolean) : [],
    notizen: row.notizen,
  })
}

function parseExcelDate(val) {
  if (!val && val !== 0) return ''
  if (typeof val === 'number') {
    const ms = (val - 25569) * 86400 * 1000
    const d = new Date(ms)
    const y = d.getUTCFullYear()
    const m = String(d.getUTCMonth() + 1).padStart(2, '0')
    const day = String(d.getUTCDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }
  if (typeof val === 'string') {
    const de = val.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/)
    if (de) return `${de[3]}-${de[2].padStart(2, '0')}-${de[1].padStart(2, '0')}`
    if (/^\d{4}-\d{2}-\d{2}/.test(val)) return val.slice(0, 10)
  }
  return ''
}

function fuzzyMatch(text, word) {
  const t = (text || '').toLowerCase()
  const q = word.toLowerCase()
  let qi = 0
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) qi++
  }
  return qi === q.length
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(
    () => sessionStorage.getItem('vb_logged_in') === 'true'
  )
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('vb_dark') === 'true')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [groesseFilter, setGroesseFilter] = useState('all')
  const [farbenFilter, setFarbenFilter] = useState('all')
  const [sortConfig, setSortConfig] = useState({ key: 'datumEinkauf', direction: 'desc' })
  const [modal, setModal] = useState(null)
  const [deletedEntry, setDeletedEntry] = useState(null)
  const fileRef = useRef()
  const undoTimerRef = useRef()

  useEffect(() => {
    supabase
      .from('eintraege')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error('Ladefehler:', error.message)
        else setEntries((data || []).map(fromDb))
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    localStorage.setItem('vb_dark', String(darkMode))
  }, [darkMode])

  const filtered = useMemo(() => {
    let r = [...entries]
    if (statusFilter !== 'all') r = r.filter(e => e.status === statusFilter)
    if (groesseFilter !== 'all') r = r.filter(e => e.groesse === groesseFilter)
    if (farbenFilter !== 'all') r = r.filter(e => (e.farben || []).includes(farbenFilter))
    if (search.trim()) {
      const words = search.trim().split(/\s+/).filter(Boolean)
      r = r.filter(e => {
        const fields = [e.name, e.artikelnummer, e.notizen, e.groesse, ...(e.farben || [])]
        return words.every(word => fields.some(field => fuzzyMatch(field, word)))
      })
    }
    r.sort((a, b) => {
      let av = a[sortConfig.key] ?? ''
      let bv = b[sortConfig.key] ?? ''
      if (['einkauf', 'verkauf', 'gewinn'].includes(sortConfig.key)) {
        av = parseFloat(av) || 0
        bv = parseFloat(bv) || 0
      }
      if (av < bv) return sortConfig.direction === 'asc' ? -1 : 1
      if (av > bv) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
    return r
  }, [entries, statusFilter, groesseFilter, farbenFilter, search, sortConfig])

  function handleSort(key) {
    setSortConfig(p => ({
      key,
      direction: p.key === key && p.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  async function handleSave(formData) {
    const processed = processEntry(formData)
    if (modal.entry) {
      const { error } = await supabase
        .from('eintraege')
        .update(toDb(processed))
        .eq('id', modal.entry.id)
      if (error) { alert('Fehler beim Speichern: ' + error.message); return }
      setEntries(p => p.map(e => e.id === modal.entry.id ? { ...processed, id: e.id } : e))
    } else {
      const newEntry = { ...processed, id: genId() }
      const { error } = await supabase.from('eintraege').insert(toDb(newEntry))
      if (error) { alert('Fehler beim Speichern: ' + error.message); return }
      setEntries(p => [...p, newEntry])
    }
    setModal(null)
  }

  function handleDelete(id) {
    const entry = entries.find(e => e.id === id)
    if (!entry) return
    setEntries(p => p.filter(e => e.id !== id))
    supabase.from('eintraege').delete().eq('id', id)
    setDeletedEntry(entry)
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
    undoTimerRef.current = setTimeout(() => setDeletedEntry(null), 5000)
  }

  async function handleUndoDelete() {
    if (!deletedEntry) return
    clearTimeout(undoTimerRef.current)
    await supabase.from('eintraege').insert(toDb(deletedEntry))
    setEntries(p => [...p, deletedEntry])
    setDeletedEntry(null)
  }

  async function handleAutoExtract() {
    const toUpdate = []
    const nextEntries = entries.map(entry => {
      const detected = extractSizeAndColors(entry.name)
      const groesse = entry.groesse || detected.groesse
      const farben = entry.farben.length > 0 ? entry.farben : detected.farben
      if (groesse === entry.groesse && JSON.stringify(farben) === JSON.stringify(entry.farben)) return entry
      const updated = processEntry({ ...entry, groesse, farben })
      toUpdate.push(updated)
      return updated
    })

    if (toUpdate.length === 0) {
      alert('Keine neuen Größen oder Farben in den Artikelnamen gefunden.')
      return
    }

    for (const entry of toUpdate) {
      await supabase.from('eintraege').update(toDb(entry)).eq('id', entry.id)
    }
    setEntries(nextEntries)
    alert(`✓ ${toUpdate.length} Artikel automatisch aktualisiert.`)
  }


  function handleImport(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async evt => {
      try {
        const wb = XLSX.read(evt.target.result, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1 })
        if (rows.length < 2) { alert('Datei ist leer oder hat keine Datenzeilen.'); return }

        const imported = rows
          .slice(1)
          .filter(r => r.some(Boolean))
          .map(r => processEntry({
            id: genId(),
            artikelnummer: String(r[0] ?? '').trim(),
            name: String(r[1] ?? '').trim(),
            datumEinkauf: parseExcelDate(r[2]),
            datumVerkauf: parseExcelDate(r[3]),
            einkauf: parseFloat(r[4]) || 0,
            verkauf: parseFloat(r[5]) || 0,
            status: String(r[7] ?? '').trim() || 'verfügbar',
            groesse: String(r[8] ?? '').trim(),
            farben: String(r[9] ?? '').split(',').map(s => s.trim()).filter(Boolean),
            notizen: String(r[10] ?? '').trim(),
          }))

        const existingNrs = new Set(entries.map(e => e.artikelnummer).filter(Boolean))
        const newOnes = imported.filter(e => !e.artikelnummer || !existingNrs.has(e.artikelnummer))
        const skipped = imported.length - newOnes.length

        if (newOnes.length > 0) {
          const { error } = await supabase.from('eintraege').insert(newOnes.map(toDb))
          if (error) { alert('Import-Fehler: ' + error.message); return }
          setEntries(prev => [...prev, ...newOnes])
        }
        alert(`Import abgeschlossen:\n✓ ${newOnes.length} neue Einträge hinzugefügt${skipped > 0 ? `\n⚠ ${skipped} Duplikate übersprungen` : ''}`)
      } catch (err) {
        alert('Import-Fehler: ' + err.message)
      }
    }
    reader.readAsArrayBuffer(file)
    e.target.value = ''
  }

  function handleExportCSV() {
    const header = ['Artikelnummer', 'Name', 'Datum Einkauf', 'Datum Verkauf', 'Einkauf', 'Verkauf', 'Gewinn', 'Status', 'Größe', 'Farben', 'Notizen']
    const rows = filtered.map(e => [
      e.artikelnummer, e.name, e.datumEinkauf, e.datumVerkauf,
      e.einkauf, e.verkauf, e.gewinn, e.status,
      e.groesse, (e.farben || []).join(', '), e.notizen,
    ])
    const csv = [header, ...rows]
      .map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
    triggerDownload(blob, 'buchhaltung.csv')
  }

  function handleExportExcel() {
    const data = filtered.map(e => ({
      'Artikelnummer': e.artikelnummer,
      'Name': e.name,
      'Datum Einkauf': e.datumEinkauf,
      'Datum Verkauf': e.datumVerkauf,
      'Einkauf (€)': e.einkauf,
      'Verkauf (€)': e.verkauf,
      'Gewinn (€)': e.gewinn,
      'Status': e.status,
      'Größe': e.groesse,
      'Farben': (e.farben || []).join(', '),
      'Notizen': e.notizen,
    }))
    const ws = XLSX.utils.json_to_sheet(data)
    ws['!cols'] = [10, 25, 14, 14, 12, 12, 12, 16, 8, 20, 30].map(w => ({ wch: w }))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Buchhaltung')
    XLSX.writeFile(wb, 'buchhaltung.xlsx')
  }

  function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  function handleLogout() {
    sessionStorage.removeItem('vb_logged_in')
    setLoggedIn(false)
  }

  if (!loggedIn) {
    return (
      <div className={darkMode ? 'dark' : ''}>
        <LoginScreen onLogin={() => setLoggedIn(true)} />
      </div>
    )
  }

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-200">
        <Header
          darkMode={darkMode}
          onToggleDark={() => setDarkMode(d => !d)}
          searchQuery={search}
          onSearch={setSearch}
          statusFilter={statusFilter}
          onFilterChange={setStatusFilter}
          groesseFilter={groesseFilter}
          onGroesseChange={setGroesseFilter}
          farbenFilter={farbenFilter}
          onFarbenChange={setFarbenFilter}
          onAdd={() => setModal({ entry: null })}
          onImport={() => fileRef.current?.click()}
          onExportCSV={handleExportCSV}
          onExportExcel={handleExportExcel}
          onAutoExtract={handleAutoExtract}
          totalCount={entries.length}
          onLogout={handleLogout}
        />
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={handleImport}
        />
        <main className="max-w-screen-2xl mx-auto px-6 py-6">
          {loading ? (
            <div className="flex items-center justify-center py-32 text-gray-400 dark:text-gray-600">
              <svg className="animate-spin h-8 w-8 mr-3 text-indigo-500" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span className="text-sm">Daten werden geladen…</span>
            </div>
          ) : (
            <>
              <SummaryBar entries={filtered} total={entries.length} />
              <Table
                entries={filtered}
                sortConfig={sortConfig}
                onSort={handleSort}
                onEdit={entry => setModal({ entry })}
                onDelete={handleDelete}
              />
              <p className="mt-4 text-xs text-gray-400 dark:text-gray-600 text-center">
                Daten werden in Supabase gespeichert — auf jedem Gerät verfügbar.
              </p>
            </>
          )}
        </main>
        {modal !== null && (
          <EntryModal
            entry={modal.entry}
            onSave={handleSave}
            onClose={() => setModal(null)}
          />
        )}
        {deletedEntry && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-gray-800 dark:bg-gray-700 text-white px-5 py-3 rounded-xl shadow-xl border border-gray-600 whitespace-nowrap">
            <span className="text-sm">„{deletedEntry.name}" gelöscht</span>
            <button
              onClick={handleUndoDelete}
              className="text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors underline underline-offset-2"
            >
              Rückgängig
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
