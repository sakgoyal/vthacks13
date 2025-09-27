/** @type {import("chrome-types")} */
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "fetchApi") {
    (async () => {
      try {
        const res = await fetch(`https://vthacks13.saksham.dev/${msg.videoId}`);
        const text = await res.text();
        sendResponse({ success: true, data: text });
      } catch (err) {
        sendResponse({ success: false, error: err.toString() });
      }
    })();

    return true; // <--- keeps port open for async sendResponse
  }
});
