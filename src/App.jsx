import { useEffect, useMemo, useState } from 'react';
import StartScreen from './components/StartScreen';
import Countdown from './components/Countdown';
import LiveMeter from './components/LiveMeter';
import ResultScreen from './components/ResultScreen';
import Leaderboard from './components/Leaderboard';
import MicrophoneSelector from './components/MicrophoneSelector';
import CalibrationPanel from './components/CalibrationPanel';
import { useAudioAnalyser } from './hooks/useAudioAnalyser';
import { useApplauseMeter } from './hooks/useApplauseMeter';
import { clearLeaderboard, getLeaderboard, removeEntry, saveEntry } from './utils/storage';
import { exportLeaderboardToCsv } from './utils/csv';

export default function App() {
  const [artist, setArtist] = useState('');
  const [noiseFloor, setNoiseFloor] = useState(0.01);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showMicSelector, setShowMicSelector] = useState(false);

  const {
    hasMediaSupport,
    devices,
    selectedDeviceId,
    setSelectedDeviceId,
    permissionState,
    error: audioError,
    requestPermission,
    start,
    stop,
  } = useAudioAnalyser();

  const meter = useApplauseMeter({
    startAnalyser: start,
    stopAnalyser: stop,
    noiseFloor,
    setNoiseFloor,
  });

  useEffect(() => {
    setLeaderboard(getLeaderboard());
  }, []);

  useEffect(() => () => stop(), [stop]);

  const disabledActions = meter.phase === 'measuring' || meter.phase === 'calibrating' || meter.phase === 'countdown';

  const topMessage = useMemo(() => {
    if (!hasMediaSupport) return 'Browser non supportato: usa Chrome, Edge o Firefox recente.';
    if (audioError) return audioError;
    return meter.statusMessage;
  }, [audioError, hasMediaSupport, meter.statusMessage]);

  const handleTestMic = async () => {
    const ok = await requestPermission();
    setShowMicSelector(ok);
  };

  const handleSaveResult = () => {
    if (!meter.result || !artist.trim()) return;

    const updated = saveEntry({
      id: crypto.randomUUID(),
      artist: artist.trim(),
      score: meter.result.score,
      createdAt: new Date().toISOString(),
      avgIntensity: meter.result.avgIntensity,
      peakIntensity: meter.result.peakIntensity,
      usefulDuration: meter.result.usefulDuration,
      stability: meter.result.stability,
    });

    setLeaderboard(updated);
    setShowLeaderboard(true);
  };

  const onDeleteEntry = (id) => setLeaderboard(removeEntry(id));

  const onResetLeaderboard = () => {
    if (!window.confirm('Confermi il reset completo della classifica?')) return;
    clearLeaderboard();
    setLeaderboard([]);
  };

  const onToggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen?.();
    } else {
      await document.exitFullscreen?.();
    }
  };

  return (
    <main className="app-shell">
      <div className="glow glow-a" />
      <div className="glow glow-b" />

      {meter.phase === 'idle' && !showLeaderboard && !showMicSelector && (
        <StartScreen
          artist={artist}
          setArtist={setArtist}
          onTestMic={handleTestMic}
          onCalibrate={meter.calibrate}
          onStart={meter.startMeasurement}
          onOpenLeaderboard={() => setShowLeaderboard(true)}
          onToggleFullscreen={onToggleFullscreen}
          disabled={disabledActions || !hasMediaSupport}
          noiseFloor={noiseFloor}
          statusMessage={topMessage}
        />
      )}

      {meter.phase === 'calibrating' && (
        <CalibrationPanel secondsLeft={meter.secondsLeft} totalSeconds={meter.calibrationSeconds} />
      )}

      {meter.phase === 'countdown' && <Countdown value={meter.countdown} />}

      {meter.phase === 'measuring' && (
        <LiveMeter
          intensity={meter.liveNormalized}
          secondsLeft={meter.secondsLeft}
          isApplauseActive={meter.isApplauseActive}
        />
      )}

      {meter.phase === 'result' && !showLeaderboard && (
        <ResultScreen
          artist={artist}
          result={meter.result}
          onSave={handleSaveResult}
          onBack={meter.reset}
        />
      )}

      {showLeaderboard && (
        <Leaderboard
          entries={leaderboard}
          onDelete={onDeleteEntry}
          onReset={onResetLeaderboard}
          onExport={() => exportLeaderboardToCsv(leaderboard)}
          onClose={() => {
            setShowLeaderboard(false);
            if (meter.phase === 'result') {
              meter.reset();
            }
          }}
        />
      )}

      {showMicSelector && (
        <MicrophoneSelector
          devices={devices}
          selectedDeviceId={selectedDeviceId}
          onSelect={setSelectedDeviceId}
          permissionState={permissionState}
          error={audioError}
          onClose={() => setShowMicSelector(false)}
        />
      )}
    </main>
  );
}
