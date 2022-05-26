export function getUnixTimestamp(datetime) {
  return Math.floor(+new Date(datetime) / 1000.0)
}
