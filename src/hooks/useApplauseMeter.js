import { useCallback, useMemo, useRef, useState } from 'react';
import { calculateApplauseScore, clamp } from '../utils/scoring';

const CALIBRATION_SECONDS = 5;
const SESSION_SECONDS = 10;
const COUNTDOWN_SECONDS = 3;

export function useApplauseMeter({ startAnalyser, stopAnalyser, noiseFloor, setNoiseFloor }) {
  const [phase, setPhase] = useState('idle');
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [secondsLeft, setSecondsLeft] = useState(SESSION_SECONDS);
  const [liveNormalized, setLiveNormalized] = useState(0);
  const [isApplauseActive, setIsApplauseActive] = useState(false);
  const [result, setResult] = useState(null);
  const [statusMessage, setStatusMessage] = useState('Pronto per iniziare.');

  const frameBufferRef = useRef([]);
  const calibrationBufferRef = useRef([]);
  const timersRef = useRef([]);
  const lockRef = useRef(false);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timerId) => clearInterval(timerId));
    timersRef.current = [];
  }, []);

  const cleanup = useCallback(() => {
    clearTimers();
    stopAnalyser();
    lockRef.current = false;
  }, [clearTimers, stopAnalyser]);

  const normalize = useCallback(
    (rms) => {
      const floor = noiseFloor ?? 0.01;
      const normalized = (rms - floor) / (0.25 - floor);
      return clamp(normalized, 0, 1);
    },
    [noiseFloor],
  );

  const calibrate = useCallback(async () => {
    if (lockRef.current) return false;
    lockRef.current = true;

    setPhase('calibrating');
    setStatusMessage('Calibrazione ambiente in corso… restare in silenzio.');
    calibrationBufferRef.current = [];

    const started = await startAnalyser((rms) => {
      calibrationBufferRef.current.push(rms);
    });

    if (!started) {
      setPhase('idle');
      setStatusMessage('Errore calibrazione. Verifica il microfono.');
      lockRef.current = false;
      return false;
    }

    const interval = setInterval(() => {
      const elapsed = calibrationBufferRef.current.length / 60;
      const left = Math.max(0, CALIBRATION_SECONDS - elapsed);
      setSecondsLeft(Number(left.toFixed(1)));
    }, 120);

    timersRef.current.push(interval);

    await new Promise((resolve) => setTimeout(resolve, CALIBRATION_SECONDS * 1000));

    cleanup();
    const avgNoise =
      calibrationBufferRef.current.reduce((sum, value) => sum + value, 0) /
      Math.max(calibrationBufferRef.current.length, 1);

    setNoiseFloor(Number(avgNoise.toFixed(4)));
    setPhase('idle');
    setSecondsLeft(SESSION_SECONDS);
    setStatusMessage(`Calibrazione completata. Noise floor: ${avgNoise.toFixed(4)}`);
    return true;
  }, [cleanup, setNoiseFloor, startAnalyser]);

  const startMeasurement = useCallback(async () => {
    if (lockRef.current) return false;
    lockRef.current = true;

    setResult(null);
    frameBufferRef.current = [];
    setPhase('countdown');
    setCountdown(COUNTDOWN_SECONDS);
    setStatusMessage('Preparati: misurazione in partenza.');

    await new Promise((resolve) => {
      const countdownTimer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownTimer);
            resolve();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      timersRef.current.push(countdownTimer);
    });

    setPhase('measuring');
    setSecondsLeft(SESSION_SECONDS);
    setStatusMessage('Audience Energy Score live…');

    const threshold = clamp((noiseFloor || 0.01) * 2.3, 0.02, 0.25);

    const started = await startAnalyser((rms) => {
      const normalized = normalize(rms);
      frameBufferRef.current.push(normalized);
      setLiveNormalized(normalized);
      setIsApplauseActive(rms > threshold);
    });

    if (!started) {
      setPhase('idle');
      setStatusMessage('Impossibile avviare misurazione.');
      lockRef.current = false;
      return false;
    }

    const sessionStart = Date.now();
    const meterTimer = setInterval(() => {
      const elapsedSeconds = (Date.now() - sessionStart) / 1000;
      const left = Math.max(0, SESSION_SECONDS - elapsedSeconds);
      setSecondsLeft(Number(left.toFixed(1)));
      if (left <= 0) {
        clearInterval(meterTimer);
      }
    }, 80);
    timersRef.current.push(meterTimer);

    await new Promise((resolve) => setTimeout(resolve, SESSION_SECONDS * 1000));

    cleanup();
    setPhase('result');
    setIsApplauseActive(false);
    setLiveNormalized(0);

    const scoring = calculateApplauseScore({
      normalizedFrames: frameBufferRef.current,
      threshold: clamp((threshold - (noiseFloor || 0)) / (0.25 - (noiseFloor || 0.01)), 0.1, 0.9),
      sessionSeconds: SESSION_SECONDS,
    });

    setResult(scoring);
    setStatusMessage(`Misurazione completata. Indice Applausometro GMF: ${scoring.score}`);
    return true;
  }, [cleanup, noiseFloor, normalize, startAnalyser]);

  const reset = useCallback(() => {
    cleanup();
    setPhase('idle');
    setCountdown(COUNTDOWN_SECONDS);
    setSecondsLeft(SESSION_SECONDS);
    setLiveNormalized(0);
    setIsApplauseActive(false);
    setResult(null);
    setStatusMessage('Pronto per una nuova band.');
  }, [cleanup]);

  const viewState = useMemo(
    () => ({
      phase,
      countdown,
      secondsLeft,
      liveNormalized,
      isApplauseActive,
      result,
      statusMessage,
      calibrationSeconds: CALIBRATION_SECONDS,
      sessionSeconds: SESSION_SECONDS,
    }),
    [countdown, isApplauseActive, liveNormalized, phase, result, secondsLeft, statusMessage],
  );

  return {
    ...viewState,
    calibrate,
    startMeasurement,
    reset,
  };
}
