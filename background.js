// Clicking the toolbar icon toggles the floating panel on the current page
// (and brings the floating button back if it was hidden on that site).
chrome.action.onClicked.addListener((tab) => {
  if (!tab || !tab.id) return;
  chrome.tabs.sendMessage(tab.id, { type: "toggle" }).catch(() => {
    // Pages like chrome:// or the Web Store don't allow content scripts.
  });
});
