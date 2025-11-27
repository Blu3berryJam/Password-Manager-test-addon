const enc = new TextEncoder();
const dec = new TextDecoder();

async function importRawKey(raw: ArrayBuffer) {
  return crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

async function encryptAESGCM(key: CryptoKey, plaintext: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(plaintext));
  return {
    iv: bufToB64(iv.buffer),
    ciphertext: bufToB64(ct),
  };
}

async function decryptAESGCM(key: CryptoKey, ivB64: string, ciphertextB64: string) {
  const iv = new Uint8Array(b64ToBuf(ivB64));
  const ct = b64ToBuf(ciphertextB64);
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
  return dec.decode(pt);
}

function bufToB64(buf: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}
function b64ToBuf(b64: string) {
  return Uint8Array.from(atob(b64), c => c.charCodeAt(0)).buffer;
}

export { importRawKey, encryptAESGCM, decryptAESGCM, bufToB64, b64ToBuf };
