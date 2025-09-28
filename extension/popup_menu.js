/// <reference lib="dom" />
// deno-lint-ignore-file no-window
function getYouTubeVideoId(url) {
  const match = url.match(/[?&]v=([^&]+)/) || url.match(/youtu\.be\/([^?&]+)/);
  return match ? match[1] : null;
}
const href = window.location.href;
const currentVideoId = getYouTubeVideoId(href);

if (currentVideoId) {
  setDialog(currentVideoId);
}

function renderDialog(apiResponse) {
  const parsed = JSON.parse(apiResponse);
  return `
    <dialog open style="z-index: 9999;align-self: anchor-center;font-size: x-large;">
      <h3>Stop the Slop</h3>
      <ul>Worth Watching: ${parsed["Worth Watching"] || "N/A"}</ul>
      <ul>Worth Time: ${parsed["Worth Time"] || "N/A"}</ul>
      <ul>Mental Health Effect: ${parsed["Mental Health Effect"] || "N/A"}</ul>
      <ul>Overall Score: ${parsed["Overall Score"] || "N/A"}</ul>
      ${parsed['Mental Health Effect'] < 0 ? `<strong style="color: red;">This video might not be good for your mental health.</strong><br/>` : ''}
      ${parsed['Overall Score'] < 50 ? `<strong style="color: red;">This video is likely not worth your time.</strong>` : ''}
      <button onclick="this.closest('dialog').close()">OK</button>
    </dialog>
  `;
}

function setDialog(currentVideoId) {
  chrome.runtime.sendMessage({ type: "fetchApi", videoId: currentVideoId }, (res) => {
    if (res.success) {
      document.body.insertAdjacentHTML("beforeend", renderDialog(res.data));
    } else {
      console.error("API error:", res.error);
    }
  });
}
