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
  
  if (request.action === 'getCredentials') {
    const credentials = getTestCredentials();
    console.log('Sending credentials:', credentials);
    sendResponse({ credentials });
    return true;
  }
});