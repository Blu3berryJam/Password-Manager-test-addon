interface StoredCredential {
  id: string;
  website: string;
  username: string;
  password: string;
  createdAt: Date;
}
let webInterfaceOpened = false;

async function getVersion() {
  try {
    const manifest = chrome.runtime.getManifest();
    return manifest.version;
  } catch (error) {
    return '0.2.0'; 
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Popup loaded');
  
  const version = await getVersion();
  const versionElement = document.getElementById('version-info');
  if (versionElement) {
    versionElement.textContent = `Version ${version} (Alpha)`;
  }
  
  await loadCredentials();
  setupAutoFillToggle();
  setupWebInterfaceButton();

  document.getElementById("pick")!.addEventListener("click", () => {
    // 1. Pobieramy ukryty input
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) {
      // 2. Programowo klikamy na input
      fileInput.click();
    }
  });

  // Dodaj nowy listener dla zmiany w ukrytym input
  document.getElementById('file-input')!.addEventListener('change', async (event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0]; // Pobieramy wybrany plik
    
    if (!file) return;

    const data = await file.arrayBuffer();
    const key = new Uint8Array(data);

    // Wyślij master key do background (Twoja oryginalna logika)
    const response = await chrome.runtime.sendMessage({ action: 'unlock', key });
    if (response.ok) {
      console.log('Key loaded!');
      await loadCredentials();
    } else {
      alert('Failed to unlock key');
    }

    // Opcjonalnie: resetuj input, aby umożliwić ponowne załadowanie tego samego pliku
    target.value = '';
  });
});

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Popup loaded');
  await loadCredentials();
  setupAutoFillToggle();
  setupWebInterfaceButton();
});

async function loadCredentials() {
  try {
    console.log('Loading credentials...');
    const response = await chrome.runtime.sendMessage({ action: 'getCredentials' });
    console.log('Credentials response:', response);
    
    const credentials: StoredCredential[] = response.credentials || [];
    console.log('Loaded credentials:', credentials);
    
    displayCredentials(credentials);
  } catch (error) {
    console.error('Error loading credentials:', error);
    displayCredentials([]);
  }
}

function displayCredentials(credentials: StoredCredential[]) {
  const listContainer = document.getElementById('credentials-list');
  console.log('Displaying credentials, container:', listContainer);
  
  if (!listContainer) {
    console.error('Credentials list container not found!');
    return;
  }

  if (credentials.length === 0) {
    listContainer.innerHTML = '<p style="text-align: center; color: #888; font-size: 12px;">No test data</p>';
    return;
  }

  const cred = credentials[0];
  console.log('Displaying credential:', cred);
  
  listContainer.innerHTML = `
    <div class="credential-item">
      <div class="credential-website">Test Data (for all websites)</div>
      <div class="credential-username">Username: ${cred.username}</div>
      <div class="credential-password">Password: ${cred.password}</div>
    </div>
  `;
}

function setupAutoFillToggle() {
  const toggle = document.getElementById('autoFillToggle') as HTMLInputElement;
  console.log('Setting up toggle:', toggle);
  
  if (toggle) {
    // Ustaw domyślnie na true
    toggle.checked = true;
    
    chrome.storage.local.get(['autoFillEnabled']).then((result: any) => {
      console.log('Loaded storage:', result);
      toggle.checked = result.autoFillEnabled !== false;
    });

    toggle.addEventListener('change', () => {
      console.log('Toggle changed:', toggle.checked);
      chrome.storage.local.set({ autoFillEnabled: toggle.checked });
    });
  } else {
    console.error('Toggle element not found!');
  }
}

function setupWebInterfaceButton() {
  const manageButton = document.getElementById('manage-passwords') as HTMLButtonElement;
  if (manageButton) {
    // Use event delegation with once option
    manageButton.addEventListener('click', function handleClick() {
      if (webInterfaceOpened) {
        console.log('Web interface already opened, ignoring click');
        return;
      }

      webInterfaceOpened = true;
      console.log('Opening web interface...');
      
      chrome.tabs.create({ url: 'http://localhost:3000' });
      
      // Remove the event listener after first click
      manageButton.removeEventListener('click', handleClick);
      
      // Re-enable after 2 seconds
      setTimeout(() => {
        webInterfaceOpened = false;
        manageButton.addEventListener('click', handleClick);
      }, 2000);
    });
  }
}

async function handleFilePick() {
  const [fileHandle] = await (window as any).showOpenFilePicker?.() || [];
  if (!fileHandle) return;

  const file = await fileHandle.getFile();
  console.log(file)
  const arrayBuffer = await file.arrayBuffer();
  console.log(arrayBuffer)

  if (arrayBuffer.byteLength !== 32) {
    alert("Master key must be 32 bytes (AES-256)");
    return;
}
  const uint8Key = new Uint8Array(arrayBuffer);
  console.log(uint8Key)
  chrome.runtime.sendMessage({
    action: "unlock",
    key: Array.from(uint8Key) 
  });
}
