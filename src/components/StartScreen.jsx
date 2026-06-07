export default function StartScreen({
  artist,
  setArtist,
  onTestMic,
  onCalibrate,
  onStart,
  onOpenLeaderboard,
  onOpenAdmin,
  onToggleFullscreen,
  disabled,
  noiseFloor,
  calibrationSettings,
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

      <div className="tuning-strip">
        <span>Noise floor: {noiseFloor ? noiseFloor.toFixed(4) : 'non calibrato'}</span>
        <span>Sensibilità: {calibrationSettings.sensitivity.toFixed(2)}x</span>
        <span>RMS max: {calibrationSettings.maxRms.toFixed(3)}</span>
      </div>
      <p className="status">{statusMessage}</p>

      <div className="actions-grid">
        <button onClick={onTestMic}>Test microfono</button>
        <button onClick={onCalibrate} disabled={disabled}>
          Calibra ambiente
        </button>
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
