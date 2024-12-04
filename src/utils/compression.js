import { encode, decode } from 'lz4';

export function compress(data) {
  if (!data) return null;
  const jsonString = JSON.stringify(data);
  const buffer = Buffer.from(jsonString);
  return encode(buffer);
}

export function decompress(data) {
  if (!data) return null;
  const decompressed = decode(data);
  const jsonString = decompressed.toString();
  return JSON.parse(jsonString);
}