export type DeviceSignals = {
  reducedMotion: boolean
  mobile: boolean
  memory?: number
  cores?: number
  saveData?: boolean
  webgl: boolean
}

// Missing device-memory support gets a conservative mobile default.
export function shouldUseScrollView(signals: DeviceSignals): boolean {
  return signals.reducedMotion || !signals.webgl || (signals.mobile && (
    signals.saveData === true || signals.memory === undefined || signals.memory <= 4 ||
    (signals.cores !== undefined && signals.cores <= 4)
  ))
}
