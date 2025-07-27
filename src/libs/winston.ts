import * as winston from 'winston';

const { combine, timestamp, label, printf } = winston.format;

const customFormat = printf(({ level, message, label, timestamp }) => {
  return `${label} | ${new Date(timestamp as string).toISOString()} | ${level.toUpperCase()} | ${message}`;
});

export const logger = winston.createLogger({
  format: combine(label({ label: 'CUSTOM-APPLICATION' }), timestamp(), customFormat),
  transports: [new winston.transports.Console()]
});
