import { useCallback, useEffect, useRef, useState } from 'react';

const hasMediaSupport =
  typeof navigator !== 'undefined' &&
  !!navigator.mediaDevices &&
  !!navigator.mediaDevices.getUserMedia &&
  typeof window !== 'undefined' &&
  !!window.AudioContext;

/**
 * Hook centralizzato per gestione microfono e analisi RMS live.
 */
export function useAudioAnalyser() {
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('default');
  const [permissionState, setPermissionState] = useState('idle');
  const [error, setError] = useState('');

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const dataArrayRef = useRef(null);
  const rafRef = useRef(null);

  const stop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    dataArrayRef.current = null;
  }, []);

  const refreshDevices = useCallback(async () => {
    try {
      const list = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = list.filter((device) => device.kind === 'audioinput');
      setDevices(audioInputs);
      if (audioInputs.length && !audioInputs.some((d) => d.deviceId === selectedDeviceId)) {
        setSelectedDeviceId(audioInputs[0].deviceId);
      }
    } catch {
      setError('Impossibile recuperare i dispositivi audio.');
    }
  }, [selectedDeviceId]);

  const requestPermission = useCallback(async () => {
    if (!hasMediaSupport) {
      setError('Browser non compatibile con Web Audio API o getUserMedia.');
      setPermissionState('unsupported');
      return false;
    }

    setError('');
    try {
      const testStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      testStream.getTracks().forEach((track) => track.stop());
      setPermissionState('granted');
      await refreshDevices();
      return true;
    } catch (err) {
      const denied = err?.name === 'NotAllowedError';
      setPermissionState(denied ? 'denied' : 'error');
      setError(denied ? 'Permesso microfono negato.' : 'Microfono non disponibile.');
      return false;
    }
  }, [refreshDevices]);

  const start = useCallback(
    async (onFrame) => {
      setError('');
      stop();

      try {
        const constraints = {
          audio:
            selectedDeviceId && selectedDeviceId !== 'default'
              ? { deviceId: { exact: selectedDeviceId } }
              : true,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;

        const context = new window.AudioContext();
        audioContextRef.current = context;

        const source = context.createMediaStreamSource(stream);
        const analyser = context.createAnalyser();
        analyser.fftSize = 2048;
        analyser.smoothingTimeConstant = 0.72;
        source.connect(analyser);

        analyserRef.current = analyser;
        const bufferLength = analyser.fftSize;
        dataArrayRef.current = new Uint8Array(bufferLength);

        const loop = () => {
          analyser.getByteTimeDomainData(dataArrayRef.current);

          // RMS su waveform normalizzata [0..1], poi convertita in indice relativo.
          let sumSquares = 0;
          for (let i = 0; i < bufferLength; i += 1) {
            const centered = (dataArrayRef.current[i] - 128) / 128;
            sumSquares += centered * centered;
          }
          const rms = Math.sqrt(sumSquares / bufferLength);
          onFrame(rms);

          rafRef.current = requestAnimationFrame(loop);
        };

        loop();
        return true;
      } catch (err) {
        setError(
          err?.name === 'NotFoundError'
            ? 'Nessun microfono disponibile.'
            : 'Errore nell’avvio del microfono.',
        );
        return false;
      }
    },
    [selectedDeviceId, stop],
  );

  useEffect(() => {
    if (hasMediaSupport) {
      navigator.mediaDevices?.addEventListener?.('devicechange', refreshDevices);
    }

    return () => {
      navigator.mediaDevices?.removeEventListener?.('devicechange', refreshDevices);
      stop();
    };
  }, [refreshDevices, stop]);

  return {
    hasMediaSupport,
    devices,
    selectedDeviceId,
    setSelectedDeviceId,
    permissionState,
    error,
    requestPermission,
    refreshDevices,
    start,
    stop,
  };
}
