import { AUDIENCE_PRESETS, applyAudiencePreset } from '../utils/settings';

const FIELD_HELP = {
  sensitivity: 'Moltiplica il segnale utile: alza per pubblici piccoli, abbassa per platee molto rumorose.',
  maxRms: 'Livello RMS considerato come applauso forte. Un valore più basso rende più facile arrivare a 100.',
  thresholdMultiplier: 'Moltiplicatore del rumore di fondo per distinguere applauso e brusio.',
};

export default function AdminPanel({ settings, noiseFloor, onChangeSettings, onChangeNoiseFloor, onClose }) {
  const updateSetting = (key, value) => {
    onChangeSettings({ ...settings, [key]: Number(value) });
  };

  const applyPreset = (presetId) => {
    onChangeSettings(applyAudiencePreset(presetId));
  };

  return (
    <section className="card admin-screen">
      <div className="heading-row">
        <div>
          <p className="eyebrow">Area amministrazione</p>
          <h2>Tarature applausometro</h2>
        </div>
        <button onClick={onClose}>Chiudi</button>
      </div>

      <p className="admin-intro">
        Adatta lo strumento alla dimensione del pubblico prima della gara: salva un preset rapido o
        rifinisci manualmente soglia, sensibilità e livello massimo atteso.
      </p>

      <div className="preset-grid">
        {AUDIENCE_PRESETS.map((preset) => (
          <button
            key={preset.id}
            className={settings.audiencePreset === preset.id ? 'preset-card active' : 'preset-card'}
            onClick={() => applyPreset(preset.id)}
          >
            <strong>{preset.label}</strong>
            <span>{preset.description}</span>
          </button>
        ))}
      </div>

      <div className="admin-grid">
        <RangeField
          label="Sensibilità generale"
          min="0.5"
          max="1.6"
          step="0.01"
          value={settings.sensitivity}
          onChange={(value) => updateSetting('sensitivity', value)}
          help={FIELD_HELP.sensitivity}
        />
        <RangeField
          label="Applauso massimo atteso (RMS)"
          min="0.08"
          max="0.5"
          step="0.005"
          value={settings.maxRms}
          onChange={(value) => updateSetting('maxRms', value)}
          help={FIELD_HELP.maxRms}
        />
        <RangeField
          label="Soglia attivazione applauso"
          min="1.4"
          max="4"
          step="0.05"
          value={settings.thresholdMultiplier}
          onChange={(value) => updateSetting('thresholdMultiplier', value)}
          help={FIELD_HELP.thresholdMultiplier}
        />
        <RangeField
          label="Noise floor manuale"
          min="0"
          max="0.08"
          step="0.0005"
          value={noiseFloor}
          onChange={(value) => onChangeNoiseFloor(Number(value))}
          help="Puoi correggere a mano il rumore ambiente dopo la calibrazione silenziosa."
          precision={4}
        />
      </div>

      <div className="calibration-summary">
        <div>
          <span>Preset attivo</span>
          <strong>{AUDIENCE_PRESETS.find((preset) => preset.id === settings.audiencePreset)?.label}</strong>
        </div>
        <div>
          <span>Noise floor</span>
          <strong>{noiseFloor.toFixed(4)}</strong>
        </div>
        <div>
          <span>Soglia RMS stimata</span>
          <strong>{Math.min(settings.maxRms, noiseFloor * settings.thresholdMultiplier).toFixed(4)}</strong>
        </div>
      </div>
    </section>
  );
}

function RangeField({ label, min, max, step, value, onChange, help, precision = 2 }) {
  return (
    <label className="field range-field">
      <span>{label}</span>
      <div className="range-row">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <output>{Number(value).toFixed(precision)}</output>
      </div>
      <small>{help}</small>
    </label>
  );
}
