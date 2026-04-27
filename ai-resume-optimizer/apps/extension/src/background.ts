chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel?.setPanelBehavior?.({ openPanelOnActionClick: false }).catch(() => undefined);
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "OPEN_DASHBOARD" && typeof message.url === "string") {
    chrome.tabs.create({ url: message.url });
  }
});
