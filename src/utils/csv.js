const header = [
  'Nome',
  'Punteggio',
  'Data',
  'IntensitaMedia',
  'PiccoMassimo',
  'DurataUtile',
  'Stabilita',
];

export function exportLeaderboardToCsv(entries) {
  const rows = entries.map((entry) => [
    sanitize(entry.artist),
    entry.score,
    sanitize(new Date(entry.createdAt).toLocaleString('it-IT')),
    entry.avgIntensity,
    entry.peakIntensity,
    entry.usefulDuration,
    entry.stability,
  ]);

  const csv = [header, ...rows].map((row) => row.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `gmf-applausometro-${Date.now()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function sanitize(value) {
  const escaped = String(value).replaceAll('"', '""');
  return `"${escaped}"`;
}
