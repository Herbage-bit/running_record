export function formatPace(seconds) {
  if (!seconds || seconds <= 0) return "--'--\"";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}'${secs < 10 ? '0' : ''}${secs}"`;
}

export function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return "00:00";
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) {
    return `${hrs}h ${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  }
  return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
}
