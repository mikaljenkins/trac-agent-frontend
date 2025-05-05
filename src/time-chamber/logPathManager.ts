import path from 'path';

export const getLogDirectory = (): string => {
  const isProduction = process.env.NODE_ENV === 'production';
  return path.join(
    process.cwd(),
    isProduction ? 'logs' : 'src',
    isProduction ? '' : 'time-chamber'
  );
};

export const getLogFilePath = (date: Date = new Date()): string => {
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
  return path.join(getLogDirectory(), `mutationLog-${dateStr}.json`);
}; 