export default function ResultScreen({ artist, result, onSave, onBack }) {
  if (!result) return null;

  return (
    <section className="card result-screen">
      <h2>Risultato finale</h2>
      <p className="artist-name">{artist}</p>
      <p className="score-burst">Indice Applausometro GMF: {result.score}</p>

      <div className="result-grid">
        <Metric label="Intensità media" value={result.avgIntensity} />
        <Metric label="Picco massimo" value={result.peakIntensity} />
        <Metric label="Durata utile" value={`${result.usefulDuration}s`} />
        <Metric label="Stabilità" value={result.stability} />
      </div>

      <div className="actions-row">
        <button className="primary" onClick={onSave}>
          Salva in classifica
        </button>
        <button onClick={onBack}>Nuova misurazione</button>
      </div>
    </section>
  );
}

function Metric({ label, value }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
