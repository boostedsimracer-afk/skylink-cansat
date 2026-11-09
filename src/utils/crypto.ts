/**
 * Cryptographic utility for securing pilot PINs/passwords
 * Uses standard W3C Web Crypto API with per-pilot salt and SHA-256 hashing.
 */

const SALT_PREFIX = 'skylink_utb_cansat_2026_salt_';

export async function hashPin(pin: string, callsign: string): Promise<string> {
  const cleanPin = pin.trim();
  const cleanCallsign = callsign.toUpperCase().trim();
  const rawString = `${SALT_PREFIX}:${cleanCallsign}:${cleanPin}`;

  const encoder = new TextEncoder();
  const data = encoder.encode(rawString);

  try {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    // Fallback simple hash if Web Crypto unavailable in legacy environment
    let hash = 0;
    for (let i = 0; i < rawString.length; i++) {
      hash = ((hash << 5) - hash + rawString.charCodeAt(i)) | 0;
    }
    return 'fallback_' + Math.abs(hash).toString(16);
  }
}

export async function verifyPin(
  enteredPin: string,
  storedHashOrPin: string,
  callsign: string
): Promise<boolean> {
  const enteredHash = await hashPin(enteredPin, callsign);
  if (enteredHash === storedHashOrPin) return true;
  // Backward compatibility with plain text if created previously
  if (enteredPin.trim() === storedHashOrPin) return true;
  return false;
}
