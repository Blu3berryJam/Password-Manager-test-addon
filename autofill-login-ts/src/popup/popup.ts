interface StoredCredential {
  id: string;
  website: string;
  username: string;
  password: string;
  createdAt: Date;
}

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
  console.log('Setting up web interface button:', manageButton);
  
  if (manageButton) {
    manageButton.addEventListener('click', () => {
      console.log('Web interface clicked');
      // Otwórz localhost:3000 w nowej karcie
      chrome.tabs.create({ url: 'http://localhost:3000' });
    });
  } else {
    console.error('Web interface button element not found!');
  }
}