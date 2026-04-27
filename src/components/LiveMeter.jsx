export default function LiveMeter({ intensity, secondsLeft, isApplauseActive }) {
  return (
    <section className="card live-screen">
      <h2>Audience Energy Score · LIVE</h2>
      <div className="thermometer">
        <div className="thermometer-fill" style={{ width: `${Math.round(intensity * 100)}%` }} />
      </div>
      <div className="live-values">
        <div>
          <span>Intensità live</span>
          <strong>{Math.round(intensity * 100)}</strong>
        </div>
        <div>
          <span>Tempo residuo</span>
          <strong>{secondsLeft.toFixed(1)}s</strong>
        </div>
      </div>
      <p className={isApplauseActive ? 'pill active' : 'pill'}>
        {isApplauseActive ? 'Applauso in corso' : 'Attesa applauso'}
      </p>
    </section>
  );
}
