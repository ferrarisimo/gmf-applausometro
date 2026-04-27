export default function StartScreen({
  artist,
  setArtist,
  onTestMic,
  onCalibrate,
  onStart,
  onOpenLeaderboard,
  onToggleFullscreen,
  disabled,
  noiseFloor,
  statusMessage,
}) {
  return (
    <section className="card start-screen">
      <h1>GMF Applausometro</h1>
      <p className="subtitle">Misura live l’Audience Energy Score del Gazza Music Festival.</p>

      <label className="field">
        <span>Band / artista</span>
        <input
          value={artist}
          onChange={(event) => setArtist(event.target.value)}
          placeholder="Es. The Neon Waves"
          maxLength={70}
        />
      </label>

      <p className="hint">Noise floor ambiente: {noiseFloor ? noiseFloor.toFixed(4) : 'non calibrato'}</p>
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
        <button onClick={onToggleFullscreen}>Modalità full screen</button>
      </div>
    </section>
  );
}
