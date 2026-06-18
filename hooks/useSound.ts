"use client";

import { useCallback, useEffect, useState } from "react";
import { soundManager } from "@/lib/soundManager";

type SoundMode = "off" | "low" | "on";

export function useSound() {
  const [mode, setModeState] = useState<SoundMode>(soundManager.getState().mode);
  const [volume, setVolumeState] = useState(soundManager.getState().volume);

  useEffect(() => {
    const unsub = soundManager.subscribe(() => {
      setModeState(soundManager.getState().mode);
      setVolumeState(soundManager.getState().volume);
    });
    return () => { unsub(); };
  }, []);

  const setMode = useCallback((m: SoundMode) => {
    soundManager.setMode(m);
  }, []);

  const setVolume = useCallback((v: number) => {
    soundManager.setVolume(v);
  }, []);

  const play = useCallback((name: Parameters<typeof soundManager.play>[0]) => {
    soundManager.play(name);
  }, []);

  const initSound = useCallback(() => {
    soundManager.init();
    if (soundManager.getState().mode === "off") {
      soundManager.setMode("low");
    }
  }, []);

  return { mode, volume, setMode, setVolume, play, initSound };
}
