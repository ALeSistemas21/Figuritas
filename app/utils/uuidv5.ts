/**
 * Deterministically generates a UUID v5 from a string name and a namespace UUID.
 * This runs both in the browser (using window.crypto) and in Node.js (using the crypto module).
 */
export async function getUUIDv5(name: string, namespace: string = "6ba7b810-9dad-11d1-80b4-00c04fd430c8"): Promise<string> {
  const hex = namespace.replace(/-/g, "");
  const nsBytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    nsBytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }

  const nameBytes = new TextEncoder().encode(name);
  const bytes = new Uint8Array(nsBytes.length + nameBytes.length);
  bytes.set(nsBytes);
  bytes.set(nameBytes, nsBytes.length);

  let hashBuffer: ArrayBuffer;
  if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
    hashBuffer = await window.crypto.subtle.digest("SHA-1", bytes);
  } else {
    // Node.js environment fallback
    const crypto = require("crypto");
    const hash = crypto.createHash("sha1");
    hash.update(bytes);
    const nodeBuf = hash.digest();
    hashBuffer = nodeBuf.buffer.slice(nodeBuf.byteOffset, nodeBuf.byteOffset + nodeBuf.byteLength);
  }

  const hashBytes = new Uint8Array(hashBuffer);

  // Set version to 5 (0x50) and variant to RFC 4122 (0x80)
  hashBytes[6] = (hashBytes[6] & 0x0f) | 0x50;
  hashBytes[8] = (hashBytes[8] & 0x3f) | 0x80;

  const toHex = (b: number) => b.toString(16).padStart(2, "0");

  return [
    Array.from(hashBytes.slice(0, 4)).map(toHex).join(""),
    Array.from(hashBytes.slice(4, 6)).map(toHex).join(""),
    Array.from(hashBytes.slice(6, 8)).map(toHex).join(""),
    Array.from(hashBytes.slice(8, 10)).map(toHex).join(""),
    Array.from(hashBytes.slice(10, 16)).map(toHex).join("")
  ].join("-");
}
