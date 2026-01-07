
async function generateAndDownloadKey() {
  // 1. Generowanie klucza (32 bajty)
  // Używamy kryptograficznie bezpiecznej funkcji.
  const keyLength = 32; 
  const key = crypto.getRandomValues(new Uint8Array(keyLength)); 
  
  // 2. Tworzenie obiektu Blob
  // Blob to surowe dane binarne klucza, z typem 'octet-stream'.
  const blob = new Blob([key], { type: "application/octet-stream" });
  
  // 3. Tworzenie URL dla Bloba
  const url = URL.createObjectURL(blob);
  
  // 4. Tworzenie tymczasowego linku (<a> element)
  const downloadLink = document.createElement('a');
  
  // Ustawienie nazwy pliku i linku
  downloadLink.href = url;
  downloadLink.download = "master.key";
  
  // 5. Wymuszenie kliknięcia i pobrania
  // Dodanie do dokumentu, kliknięcie i natychmiastowe usunięcie
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  
  // 6. Zwolnienie obiektu URL
  // Jest to ważne, aby uniknąć wycieków pamięci.
  URL.revokeObjectURL(url);

  console.log("✅ master.key został wygenerowany i rozpoczyna się pobieranie.");
}

export {generateAndDownloadKey};
