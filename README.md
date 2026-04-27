# GMF Applausometro

Web app locale per il Gazza Music Festival: misura l'energia del pubblico da microfono e produce l'**Indice Applausometro GMF** (0-100).

## Requisiti
- Node.js 18+
- Browser moderno con Web Audio API (`getUserMedia`, `AudioContext`)

## Avvio locale
```bash
npm install
npm run dev
```

## Build produzione
```bash
npm run build
npm run preview
```

## Test rapido su GitHub Pages
Il repository è configurato per deploy automatico tramite GitHub Actions (`.github/workflows/deploy-pages.yml`).

1. Pubblica il branch su GitHub e assicurati che il branch predefinito sia `main`.
2. Vai in **Settings → Pages** e imposta **Source: GitHub Actions**.
3. Fai push su `main` (oppure lancia manualmente il workflow da tab **Actions**).
4. Al termine del job `deploy`, apri l'URL Pages mostrato nell'environment `github-pages`.

### Note GitHub Pages
- `vite.config.js` imposta automaticamente `base` a `/<nome-repo>/` quando gira in CI Pages.
- In locale il `base` resta `/`, quindi l'esperienza di sviluppo non cambia.

## Flusso operativo rapido
1. Apri la schermata iniziale e inserisci il nome artista/band.
2. Clicca **Test microfono** e seleziona il dispositivo.
3. Clicca **Calibra ambiente** (5 secondi di silenzio).
4. Clicca **Avvia misurazione**:
   - countdown 3 secondi
   - analisi live 10 secondi
   - calcolo finale Audience Energy Score
5. Salva il risultato in classifica locale.
6. Da classifica puoi eliminare righe, resettare tutto, esportare CSV.

## Note tecniche
- Il dato audio usa RMS relativo: **non** è una misura in dB calibrati.
- Dati classifica e metriche sono persistiti in `localStorage`.
- Lo score combina: intensità media, picco, durata utile sopra soglia, stabilità.
