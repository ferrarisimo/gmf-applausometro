export default function Leaderboard({ entries, onDelete, onReset, onExport, onClose }) {
  return (
    <section className="card leaderboard-screen">
      <div className="heading-row">
        <h2>Classifica locale</h2>
        <button onClick={onClose}>Chiudi</button>
      </div>

      <div className="actions-row">
        <button onClick={onExport} disabled={!entries.length}>
          Esporta CSV
        </button>
        <button
          onClick={onReset}
          disabled={!entries.length}
          className="danger"
          title="Cancella tutti i risultati"
        >
          Reset classifica
        </button>
      </div>

      {!entries.length ? (
        <p>Nessun risultato salvato.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Artista</th>
                <th>Score</th>
                <th>Media</th>
                <th>Picco</th>
                <th>Durata</th>
                <th>Stabilità</th>
                <th>Data/Ora</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => (
                <tr key={entry.id}>
                  <td>{index + 1}</td>
                  <td>{entry.artist}</td>
                  <td>{entry.score}</td>
                  <td>{entry.avgIntensity}</td>
                  <td>{entry.peakIntensity}</td>
                  <td>{entry.usefulDuration}s</td>
                  <td>{entry.stability}</td>
                  <td>{new Date(entry.createdAt).toLocaleString('it-IT')}</td>
                  <td>
                    <button onClick={() => onDelete(entry.id)} className="danger ghost">
                      Elimina
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
