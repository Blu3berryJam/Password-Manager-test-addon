import { decryptAESGCM, encryptAESGCM } from './cryptoHelper'

let masterKeyRaw: Uint8Array | null = null; 
let masterCryptoKey: CryptoKey | null = null;

chrome.runtime.onInstalled.addListener(() => {
  console.log('Truly Yours Password Manager installed');
});

// Zawsze zwraca te same dane testowe
function getTestCredentials() {
  return [
    {
      id: '1',
      website: 'any-website',
      username: 'testLogin',
      password: 'testPassword',
      createdAt: new Date()
    }
  ];
}

// Obsługa wiadomości z content script i popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);
  
  // Ładowanie danych
  if (request.action === 'getCredentials') {
    if (!masterCryptoKey) return sendResponse({ ok: false, error: 'locked' });
    decypherCredentials().then((credentials) => {
      console.log('Sending credentials:', credentials);
      sendResponse({ credentials });
    }).catch(err => {
      console.error(err);
      sendResponse({ ok: false, error: 'decrypt_failed' });
    });
    return true;
  }

  // Ustawianie master key'a
 if (request.action === 'unlock') {
    const keyArray = new Uint8Array(Object.values(request.key) as number[]);

    if (keyArray.byteLength !== 32) {
      console.error("❌ Invalid key length:", keyArray.byteLength);
      return sendResponse({ ok: false, error: "invalid_key_length" });
    }
    crypto.subtle.importKey(
      "raw",
      keyArray.buffer,
      { name: "AES-GCM" },
      false,
      ["encrypt", "decrypt"]
    ).then(k => {
      masterCryptoKey = k;
      console.log("🔑 Master key loaded!");
      sendResponse({ ok: true });
    }).catch(err => {
      console.error("Failed to import key:", err);
      sendResponse({ ok: false, error: "import_failed" });
    });

    return true; 
  }
});


async function decypherCredentials() {
  if (!masterCryptoKey) throw new Error('Master key not loaded');

  // Odszyfrowanie danych
  const stored = await encryptExampleCredentials(); 
  const { iv, ciphertext } = stored;
  const plaintext = await decryptAESGCM(masterCryptoKey, iv, ciphertext);
  const cred = JSON.parse(plaintext);
  
  return cred;
}

// szyfrowanie próbne; potem wtyczka musi dostawać zaszyfrowane dane, ale
// na razie nie ma bazy danych
async function encryptExampleCredentials() {
  if (!masterCryptoKey) throw new Error('Master key not loaded');

  const credentials = getTestCredentials();
  const plaintext = JSON.stringify(credentials);
  const encrypted = await encryptAESGCM(masterCryptoKey, plaintext);
  console.log('Credentials encrypted:', encrypted);
  return encrypted;
}