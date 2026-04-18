# Deployment auf Netlify

## Option A — Drag & Drop (einfachste Methode)

1. Baue die App lokal:
   ```
   npm install
   npm run build
   ```
2. Öffne [app.netlify.com](https://app.netlify.com) → **Sites** → „drag and drop your site folder here"
3. Ziehe den **`dist/`** Ordner direkt ins Browser-Fenster
4. Fertig — die App ist sofort live!

---

## Option B — Netlify CLI (automatisch)

```bash
npm install -g netlify-cli
netlify login
netlify deploy --dir=dist --prod
```

---

## Option C — GitHub + Netlify (automatische Deploys)

1. Repository auf GitHub pushen
2. Netlify → **Add new site** → **Import an existing project** → GitHub auswählen
3. Einstellungen werden automatisch aus `netlify.toml` gelesen:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Jeder Push auf `main` löst automatisch ein neues Deploy aus.

---

## Lokale Entwicklung

```bash
npm install    # einmalig
npm run dev    # Entwicklungsserver auf http://localhost:5173
npm run build  # Produktions-Build → /dist
npm run preview # Build lokal vorschauen
```

---

## Technischer Stack

| Was              | Womit              |
|------------------|--------------------|
| Framework        | React 18 + Vite    |
| Styling          | Tailwind CSS v3    |
| Excel/CSV        | SheetJS (xlsx)     |
| Icons            | Lucide React       |
| Datenspeicherung | Browser LocalStorage |
| Hosting          | Netlify (statisch) |

**Keine Serverabhängigkeit im Produktivbetrieb** — alles läuft im Browser.
