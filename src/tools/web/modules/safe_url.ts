// Says whether an address may be fetched at all, so nothing can be aimed back at this machine.
const PRIVATE = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^169\.254\./,
  /^\[?::1\]?$/,
  /\.local$/i,
  /^0\./,
];

export function safeUrl(where: string, schemes: string[]): URL | undefined {
  let found: URL;
  try {
    found = new URL(where);
  } catch {
    return undefined;
  }
  if (!schemes.includes(found.protocol)) {
    return undefined;
  }
  if (PRIVATE.some((shape) => shape.test(found.hostname))) {
    return undefined;
  }
  return found;
}
