/** @type {import("npm:chrome-types")} */
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "fetchApi") {
    (async () => {
      try {
        const text = await fetch(`https://vthacks13.saksham.dev/${msg.videoId}`).then(r => r.text());
        const entry = { [new Date().toISOString()]: text };
        chrome.storage.local.set(entry);
        sendResponse({ success: true, data: text });
      } catch (err) {
        sendResponse({ success: false, error: err.toString() });
      }
    })();

    return true; // <--- keeps port open for async sendResponse
  }
});
