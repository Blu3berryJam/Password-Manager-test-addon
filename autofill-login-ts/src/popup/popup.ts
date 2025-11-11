interface StoredCredential {
  id: string;
  website: string;
  username: string;
  password: string;
  createdAt: Date;
}

// Get version from manifest
async function getVersion() {
  try {
    const manifest = chrome.runtime.getManifest();
    return manifest.version;
  } catch (error) {
    return '0.2.0'; // fallback
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
});

document.addEventListener('DOMContentLoaded', async () => {
  await loadCredentials();
  setupAutoFillToggle();
  setupWebInterfaceButton();
});

async function loadCredentials() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getCredentials' });
    const credentials: StoredCredential[] = response.credentials || [];
    
    displayCredentials(credentials);
  } catch (error) {
    console.error('Error loading credentials:', error);
  }
}

function displayCredentials(credentials: StoredCredential[]) {
  const listContainer = document.getElementById('credentials-list');
  
  if (!listContainer) return;

  if (credentials.length === 0) {
    listContainer.innerHTML = '<p style="text-align: center; color: #888; font-size: 12px;">Brak danych testowych</p>';
    return;
  }

  const cred = credentials[0];
  listContainer.innerHTML = `
    <div class="credential-item">
      <div class="credential-website">Dane testowe (dla wszystkich stron)</div>
      <div class="credential-username">Login: ${cred.username}</div>
      <div class="credential-password">Hasło: ${cred.password}</div>
    </div>
  `;
}

function setupAutoFillToggle() {
  const toggle = document.getElementById('autoFillToggle') as HTMLInputElement;
  
  if (toggle) {
    chrome.storage.local.get(['autoFillEnabled']).then((result: any) => {
      toggle.checked = result.autoFillEnabled !== false;
    });

    toggle.addEventListener('change', () => {
      chrome.storage.local.set({ autoFillEnabled: toggle.checked });
    });
  }
}

function setupWebInterfaceButton() {
  const manageButton = document.getElementById('manage-passwords') as HTMLButtonElement;
  
  if (manageButton) {
    manageButton.addEventListener('click', () => {
      // Na razie pokazujemy komunikat, docelowo będzie otwierać panel zarządzania
      showComingSoonMessage();
    });
  }
}

function showComingSoonMessage() {
  // Tworzymy komunikat
  const message = document.createElement('div');
  message.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    ">
      <div style="
        background: white;
        padding: 24px;
        border-radius: 8px;
        text-align: center;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      ">
        <h3 style="margin: 0 0 12px 0; color: #4285f4;"> Funkcja w budowie</h3>
        <p style="margin: 0 0 20px 0; color: #666; line-height: 1.4;">
          Panel zarządzania hasłami będzie dostępny w kolejnej wersji rozszerzenia.
        </p>
        <button style="
          background: #4285f4;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 13px;
        " onclick="this.parentElement.parentElement.remove()">
          Zamknij
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(message);

  // Zamykanie po kliknięciu w tło
  message.addEventListener('click', (e) => {
    if (e.target === message) {
      message.remove();
    }
  });
}