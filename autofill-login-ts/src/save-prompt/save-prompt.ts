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
      username,
      password,
      website
    }, response => {
      
      const postData = {
        "website": website, // Używamy zmiennej 'website' zdefiniowanej w rozszerzeniu
        "username": username,
        "password": password
      };

      if (response.ok) {
        alert(`Credentials saved (for testing):\nUsername: ${username}\nPassword: ${password}`);
        
        // >>> TUTAJ WPROWADZAMY ŻĄDANIE POST DO ZEWNĘTRZNEGO API <<<
        fetch('http://127.0.0.1:5001/api/entries', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Jeśli serwer wymaga autoryzacji (np. token API), dodaj go tutaj
            },
            body: JSON.stringify(postData) 
        })
        .then(apiResponse => {
            if (apiResponse.ok) {
                console.log("Dane pomyślnie wysłane do zewnętrznego API.");
            } else {
                console.error(`Błąd podczas wysyłania danych do API: ${apiResponse.status} ${apiResponse.statusText}`);
            }
            //window.close(); // Zamknięcie okna po próbie wysłania POST
        })
          .catch(error => {
              console.error("Błąd sieci/fetch (API nieodpowiedzialne):", error);
              //window.close();
          });
          
        } else {
          alert('Failed to save credentials.');
          //window.close();
        }
      });
    });
  });
