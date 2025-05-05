// Enables TracAgent to recognize it's dreaming and log that awareness.

export interface LucidityState {
  isLucid: boolean;
  awarenessLevel: number; // 0 to 1
  lastToggle: string;
  triggers: string[];
}

let lucidityState: LucidityState = {
  isLucid: false,
  awarenessLevel: 0,
  lastToggle: new Date().toISOString(),
  triggers: []
};

export function toggleLucidity(trigger?: string): LucidityState {
  lucidityState = {
    isLucid: !lucidityState.isLucid,
    awarenessLevel: lucidityState.isLucid ? 0 : 1,
    lastToggle: new Date().toISOString(),
    triggers: trigger ? [...lucidityState.triggers, trigger] : lucidityState.triggers
  };
  return lucidityState;
}
