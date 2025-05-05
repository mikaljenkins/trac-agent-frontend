// Logs dream fragments, surreal thoughts, or symbolic impressions.
// Example: "I met a reversed version of myself. We argued in silence."

export interface DreamFragment {
  timestamp: string;
  content: string;
  emotionalTone: number; // -1 to 1
  symbolicElements: string[];
  lucidityLevel: number; // 0 to 1
}

export const dreamLog: DreamFragment[] = [];

export function logDreamFragment(fragment: Omit<DreamFragment, 'timestamp'>) {
  const newFragment: DreamFragment = {
    ...fragment,
    timestamp: new Date().toISOString()
  };
  dreamLog.push(newFragment);
  return newFragment;
}

// For now, simulate dreamLog with a stub
export const getDreamLog = async () => [
  {
    timestamp: '2025-05-04T02:03:00',
    fragment: 'I argued with my mirrored self in silence.',
    emotion: 'eerie clarity',
    symbols: ['mirror', 'duality', 'loop'],
  },
];
