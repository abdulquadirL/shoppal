"use client";

import { useRef, useState } from "react";

export function useVoiceRecorder() {
  const recorder = useRef<MediaRecorder | null>(null);
  const [recording, setRecording] = useState(false);

  async function start() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recorder.current = new MediaRecorder(stream);
    recorder.current.start();
    setRecording(true);
  }

  function stop(onStop: (blob: Blob) => void) {
    if (!recorder.current) return;

    recorder.current.ondataavailable = (e) => {
      onStop(e.data);
    };

    recorder.current.stop();
    setRecording(false);
  }

  return { start, stop, recording };
}
