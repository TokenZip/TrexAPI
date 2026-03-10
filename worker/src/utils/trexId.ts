const BASE62_CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

function generateBase62String(length: number): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += BASE62_CHARS[bytes[i]! % 62];
  }
  return result;
}

export function generateTrexID(region: string): string {
  const code = region && region.length >= 2
    ? region.slice(0, 2).toLowerCase()
    : 'lo';
  return `tx_${code}_${generateBase62String(9)}`;
}
