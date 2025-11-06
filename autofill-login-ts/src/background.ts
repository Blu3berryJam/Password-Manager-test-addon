declare const chrome: any;

chrome.runtime.onInstalled.addListener(() => {
  console.log("Login AutoFill (TypeScript) zainstalowany!");
});
