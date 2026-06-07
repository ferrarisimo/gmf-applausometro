export const DEFAULT_CALIBRATION_SETTINGS = {
  audiencePreset: 'medium',
  sensitivity: 1,
  maxRms: 0.25,
  thresholdMultiplier: 2.3,
};

const SETTINGS_KEY = 'gmf-applausometro-calibration-settings';
const NOISE_FLOOR_KEY = 'gmf-applausometro-noise-floor';
const PRESET_VALUES = {
  small: { sensitivity: 1.28, maxRms: 0.18, thresholdMultiplier: 2.05 },
  medium: { sensitivity: 1, maxRms: 0.25, thresholdMultiplier: 2.3 },
  large: { sensitivity: 0.82, maxRms: 0.34, thresholdMultiplier: 2.65 },
};

export const AUDIENCE_PRESETS = [
  {
    id: 'small',
    label: 'Pubblico ridotto',
    description: 'Aumenta la sensibilità per sale piccole o pochi spettatori.',
  },
  {
    id: 'medium',
    label: 'Pubblico standard',
    description: 'Taratura bilanciata per eventi medi del festival.',
  },
  {
    id: 'large',
    label: 'Pubblico numeroso',
    description: 'Riduce la sensibilità per evitare saturazioni con platee grandi.',
  },
];

export function getPresetSettings(presetId) {
  return PRESET_VALUES[presetId] ?? PRESET_VALUES.medium;
}

export function normalizeCalibrationSettings(value) {
  const preset = AUDIENCE_PRESETS.some((item) => item.id === value?.audiencePreset)
    ? value.audiencePreset
    : DEFAULT_CALIBRATION_SETTINGS.audiencePreset;

  return {
    audiencePreset: preset,
    sensitivity: clampSetting(value?.sensitivity, 0.5, 1.6, DEFAULT_CALIBRATION_SETTINGS.sensitivity),
    maxRms: clampSetting(value?.maxRms, 0.08, 0.5, DEFAULT_CALIBRATION_SETTINGS.maxRms),
    thresholdMultiplier: clampSetting(
      value?.thresholdMultiplier,
      1.4,
      4,
      DEFAULT_CALIBRATION_SETTINGS.thresholdMultiplier,
    ),
  };
}

export function applyAudiencePreset(presetId) {
  return normalizeCalibrationSettings({
    audiencePreset: presetId,
    ...getPresetSettings(presetId),
  });
}

export function loadCalibrationSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return normalizeCalibrationSettings(raw ? JSON.parse(raw) : DEFAULT_CALIBRATION_SETTINGS);
  } catch {
    return DEFAULT_CALIBRATION_SETTINGS;
  }
}

export function saveCalibrationSettings(settings) {
  const normalized = normalizeCalibrationSettings(settings);
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(normalized));
  return normalized;
}

export function loadNoiseFloor() {
  try {
    return clampSetting(localStorage.getItem(NOISE_FLOOR_KEY), 0, 0.08, 0.01);
  } catch {
    return 0.01;
  }
}

export function saveNoiseFloor(value) {
  const normalized = clampSetting(value, 0, 0.08, 0.01);
  localStorage.setItem(NOISE_FLOOR_KEY, String(normalized));
  return normalized;
}

function clampSetting(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}
