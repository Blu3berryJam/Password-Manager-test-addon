import { encrypt_data } from "crypto-module";
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const username = urlParams.get('username');
  const password = urlParams.get('password');
  const website = urlParams.get('website');

  const websitePlaceholder = document.getElementById('website-placeholder');
  if (websitePlaceholder && website) {
    websitePlaceholder.textContent = website;
  }

  document.getElementById('save-yes')?.addEventListener('click', () => {
    // Te zmienne (username, password, website) powinny być zdefiniowane wcześniej w zasięgu tego bloku!
    // Upewnij się, że są one dostępne.
    
    chrome.runtime.sendMessage({
      action: 'saveCredentials',
      data: { username, password, website }

    }, response => {

      const postData = {
        "website": website, // Używamy zmiennej 'website' zdefiniowanej w rozszerzeniu
        "username": username,
        "password": password
      };
      
      if (response.ok) {
        window.close();         
      } else {
          alert('Failed to save credentials.');
          window.close();
        }
      });
    });
  });
