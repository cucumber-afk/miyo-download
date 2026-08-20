const dateFormatter = new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', timeZone: 'UTC', year: 'numeric' });
const timestampFormatter = new Intl.DateTimeFormat('en-US', { day: 'numeric', hour: '2-digit', hour12: false, minute: '2-digit', month: 'short', timeZone: 'UTC', year: 'numeric' });

export function formatUtcDate(timestamp) {
  if (!timestamp) return 'Not available';
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? 'Not available' : dateFormatter.format(date);
}

export function formatUtcTimestamp(timestamp) {
  if (!timestamp) return 'Not published yet';
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? 'Not available' : `${timestampFormatter.format(date)} UTC`;
}

export function getUtcTimestampTitle(timestamp) {
  if (!timestamp || Number.isNaN(new Date(timestamp).getTime())) return undefined;
  return `${timestamp.replace('T', ' ').replace(/\.\d{3}Z$/, ' UTC')}`;
}
