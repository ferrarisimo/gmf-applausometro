export default function MicrophoneSelector({
  devices,
  selectedDeviceId,
  onSelect,
  permissionState,
  error,
  onClose,
}) {
  return (
    <section className="card mic-screen">
      <div className="heading-row">
        <h2>Selezione microfono</h2>
        <button onClick={onClose}>Chiudi</button>
      </div>

      <p>Permesso: {permissionState}</p>
      {error ? <p className="error">{error}</p> : null}

      <label className="field">
        <span>Dispositivo audio</span>
        <select value={selectedDeviceId} onChange={(event) => onSelect(event.target.value)}>
          {devices.length ? (
            devices.map((device, idx) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Microfono ${idx + 1}`}
              </option>
            ))
          ) : (
            <option value="default">Nessun dispositivo disponibile</option>
          )}
        </select>
      </label>
    </section>
  );
}
