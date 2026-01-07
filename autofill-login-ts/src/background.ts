import { decryptAESGCM, encryptAESGCM } from './cryptoHelper'
import {generateAndDownloadKey} from './create-master-key'

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
  (async () => {
    if (request.action === 'getCredentials') {
      try {
        const credentials = await decypherCredentials();
        console.log('Sending credentials:', credentials);
        sendResponse({ credentials });
      } catch (err) {
        console.error(err);
        sendResponse({ ok: false, error: 'decrypt_failed' });
      }
      return;
    }
    if 

    if (request.action === 'saveCredentials') {
      console.log('Saving credentials for website:', request.website);
      console.log('Username:', request.username);
      console.log('Password:', request.password);
      // TODO: Tutaj zaimplementuj szyfrowanie i wysyłanie danych do backendu
      sendResponse({ ok: true, message: 'Credentials received by background script.' });
      return;
    }

    if (request.action === 'unlock') {
      try {
        const keyArray = new Uint8Array(Object.values(request.key) as number[]);
        if (keyArray.byteLength !== 32) {
          console.error("❌ Invalid key length:", keyArray.byteLength);
          sendResponse({ ok: false, error: "invalid_key_length" });
          return;
        }
        const k = await crypto.subtle.importKey(
          "raw",
          keyArray.buffer,
          { name: "AES-GCM" },
          false,
          ["encrypt", "decrypt"]
        );
        masterCryptoKey = k;
        console.log("🔑 Master key loaded!");
        sendResponse({ ok: true });
      } catch (err) {
        console.error("Failed to import key:", err);
        sendResponse({ ok: false, error: "import_failed" });
      }
      return;
    }

    if (request.action === 'promptToSaveCredentials') {
      const url = chrome.runtime.getURL('save-prompt/save-prompt.html');
      const queryParams = new URLSearchParams({
        username: request.username,
        password: request.password,
        website: request.website
      });
      await chrome.windows.create({
        url: `${url}?${queryParams.toString()}`,
        type: 'popup',
        width: 350,
        height: 180,
      });
      // No sendResponse needed here
    }
  })();

  return true; // Zwracamy true, aby zasygnalizować asynchroniczną odpowiedź
});

async function fetchEntries(hostname: string) {
  const url = `http://127.0.0.1:5001/api/entries/${hostname}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      console.error(`Błąd API: ${response.status} ${response.statusText} - ${url }`);
      throw new Error(`Failed to fetch credentials: ${response.status}`);
    }

    const encryptedEntries = await response.json();
    console.log('Pobrano zaszyfrowane wpisy z API:', encryptedEntries);
    return encryptedEntries;
    
  } catch (error) {
    console.error('Błąd sieci podczas pobierania danych:', error);
    return []; 
  }
}

async function decypherCredentials() {
  //if (!masterCryptoKey) throw new Error('Master key not loaded');

  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const activeTab = tabs[0];

  if (activeTab?.url) {
    const url = new URL(activeTab.url);
    const currentDomain = url.hostname;
    console.log('Aktualna domena:', currentDomain);
    
    const credentials = await fetchEntries(currentDomain);
    return credentials;
  }
  
  return [];
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