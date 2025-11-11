chrome.runtime.onInstalled.addListener(() => {
  console.log('Password Autofill Extension installed');
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

// Obsługa wiadomości z content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getCredentials') {
    const credentials = getTestCredentials();
    sendResponse({ credentials });
    return true;
  }
});