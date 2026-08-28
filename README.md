# Timbrò

PWA per la gestione di ore lavorate, permessi e straordinari, con:

- Turno di entrata **alternato 7:00 / 9:00** settimana per settimana (impostabile e correggibile in caso di scambio turno con un collega)
- Riepilogo mensile e annuale, export PDF
- Sincronizzazione multi-dispositivo tramite GitHub (stesso meccanismo usato nelle altre app: Contents API + Personal Access Token)
- Installabile come app (PWA) su telefono/desktop, funziona offline grazie al service worker

## File del repository

```
index.html                  → l'app (tutto in un unico file: HTML+CSS+JS)
manifest.json                → manifest PWA (nome, icone, colori)
sw.js                        → service worker (cache offline, versionata)
icons/icon-192.png
icons/icon-512.png
icons/icon-512-maskable.png  → icone dell'app
```

I dati (ore, permessi, straordinari, turni) vivono in `localStorage` sul
dispositivo e, se configurata, vengono sincronizzati su un file JSON
(`data/ore.json` di default) dentro questo stesso repository, tramite le API
di GitHub.

## 1. Creare il repository

1. Su GitHub, crea un nuovo repository (es. `timbro`), **pubblico** (per
   GitHub Pages gratuito serve pubblico, a meno di avere un piano
   Pro/Team/Enterprise che supporta Pages su repo privati).
2. Carica in root i file elencati sopra (`index.html`, `manifest.json`,
   `sw.js`, cartella `icons/`).

## 2. Attivare GitHub Pages

1. Nel repository, vai su **Settings → Pages**.
2. In "Build and deployment" scegli **Deploy from a branch**.
3. Branch: `main`, cartella: `/ (root)`.
4. Salva. Dopo qualche minuto l'app sarà raggiungibile su:
   `https://<tuo-utente>.github.io/<nome-repo>/`

## 3. Creare il token per la sincronizzazione

Per sincronizzare i dati serve un **Personal Access Token** con permesso di
scrittura sui contenuti di questo repository:

1. Vai su **GitHub → Settings (del tuo account) → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**.
2. **Repository access**: "Only select repositories" → seleziona solo questo repo (`timbro`).
3. **Permissions → Repository permissions → Contents**: imposta su **Read and write**.
4. Genera il token e copialo subito (non sarà più visibile dopo).

> ⚠️ Il token dà accesso in scrittura solo a questo repository (se creato
> come fine-grained e scoped correttamente), ma va comunque trattato come una
> password: non condividerlo in chat/email, non committarlo nel codice. Se
> pensi sia stato esposto, revocalo subito da GitHub e generane uno nuovo.

## 4. Configurare la sincronizzazione nell'app

1. Apri l'app (dal link di GitHub Pages, o installata come PWA).
2. Apri le impostazioni di sincronizzazione (icona ingranaggio).
3. Compila:
   - **Repository**: `<tuo-utente>/timbro`
   - **Percorso file dati**: `data/ore.json` (va bene il default, viene creato automaticamente al primo push)
   - **Branch**: `main`
   - **Personal Access Token**: quello creato al punto 3
4. Premi **"⬆ Sincronizza ora"** per il primo push, oppure **"⬇ Carica da GitHub"** se stai configurando un secondo dispositivo e vuoi scaricare i dati già presenti.

Da qui in poi ogni modifica (ore, permessi, turni) viene inviata in automatico
a GitHub circa 1 secondo dopo la modifica (push).

**Novità:** oltre al push automatico, l'app fa anche un **pull automatico**
ogni volta che viene aperta o torna in primo piano (cambio di tab, si
riaccende lo schermo del telefono, si torna sull'app dopo averla lasciata in
background). Quindi, per esempio: modifichi qualcosa su iPhone → viene
salvato su GitHub dopo ~1 secondo → quando riapri o torni sul PC, l'app
scarica in automatico l'ultima versione. Non serve premere manualmente
"Carica da GitHub", a meno che tu voglia forzare un aggiornamento immediato
senza cambiare app/finestra.

## 5. Sincronizzare più dispositivi

Su ogni dispositivo:

1. Apri l'URL di GitHub Pages (o installa l'app come PWA — su Chrome/Edge
   "Installa app", su Safari iOS "Condividi → Aggiungi a Home").
2. Inserisci le **stesse** credenziali di sincronizzazione (repo, path,
   branch, token) nelle impostazioni.
3. Premi **"⬇ Carica da GitHub"** per allineare subito i dati.

Da quel momento i dispositivi restano sincronizzati automaticamente ogni
volta che l'app è aperta e connessa.

## Aggiornare l'app in futuro

Quando `index.html` (o qualsiasi asset) viene modificato, ricordati di
incrementare `CACHE_NAME` in `sw.js` (es. `timbro-cache-v1` →
`timbro-cache-v2`), altrimenti chi ha già installato l'app resterà sulla
versione vecchia in cache fino a una pulizia manuale.
