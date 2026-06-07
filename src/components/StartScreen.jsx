export default function StartScreen({
  artist,
  setArtist,
  onStart,
  onOpenLeaderboard,
  onOpenAdmin,
  onToggleFullscreen,
  disabled,
  statusMessage,
}) {
  return (
    <section className="card start-screen">
      <div className="brand-hero">
        <img src="/gmf-logo.svg" alt="Logo Gazza Music Festival GMF" className="brand-logo" />
        <div>
          <p className="eyebrow">Gazza Music Festival</p>
          <h1>GMF Applausometro</h1>
          <p className="subtitle">Misura live l’Audience Energy Score con il nuovo look ufficiale giallo e nero.</p>
        </div>
      </div>

      <label className="field">
        <span>Band / artista</span>
        <input
          value={artist}
          onChange={(event) => setArtist(event.target.value)}
          placeholder="Es. The Neon Waves"
          maxLength={70}
        />
      </label>

      <p className="status">{statusMessage}</p>

      <div className="actions-grid projection-actions">
        <button className="primary" onClick={onStart} disabled={disabled || !artist.trim()}>
          Avvia misurazione
        </button>
        <button onClick={onOpenLeaderboard}>Classifica locale</button>
        <button onClick={onOpenAdmin}>Amministrazione tarature</button>
        <button onClick={onToggleFullscreen}>Modalità full screen</button>
      </div>
    </section>
  );
}
