// Monitors TracAgent's cognitive loop
// Logs when dreamDigestor triggers thoughts
// Logs when thoughts trigger introspection
// Logs awakening moments and trust updates

export interface LoopEvent {
  source: string;
  action: string;
  payload?: any;
  timestamp?: string;
}

const loopLog: LoopEvent[] = [];

export const logLoopEvent = (event: LoopEvent) => {
  const timestampedEvent = {
    ...event,
    timestamp: event.timestamp || new Date().toISOString()
  };
  loopLog.push(timestampedEvent);
  console.log(`[LoopEvent] ${timestampedEvent.timestamp}`, timestampedEvent);
};

export const getLoopLog = (timeframe: { start?: string; end?: string } = {}) => {
  const { start, end } = timeframe;
  return loopLog.filter(event => {
    const eventTime = new Date(event.timestamp!).getTime();
    if (start && new Date(start).getTime() > eventTime) return false;
    if (end && new Date(end).getTime() < eventTime) return false;
    return true;
  });
};

export const clearLoopLog = () => {
  loopLog.length = 0;
}; 