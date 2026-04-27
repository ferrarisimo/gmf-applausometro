export default function CalibrationPanel({ secondsLeft, totalSeconds }) {
  const progress = ((totalSeconds - Math.max(secondsLeft, 0)) / totalSeconds) * 100;

  return (
    <section className="card calibration-screen">
      <h2>Calibrazione ambiente</h2>
      <p>Tieni il palco in silenzio per 5 secondi.</p>
      <div className="thermometer">
        <div className="thermometer-fill" style={{ width: `${Math.max(0, progress)}%` }} />
      </div>
      <p className="countdown-small">{Math.max(secondsLeft, 0).toFixed(1)}s</p>
    </section>
  );
}
