export default function Countdown({ value }) {
  return (
    <section className="card countdown-screen">
      <p>Inizio misurazione tra</p>
      <div className="countdown-value">{value}</div>
    </section>
  );
}
