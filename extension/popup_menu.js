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

  const ranges = {
    "Worth Watching": [
      { min: 0, max: 30, msg: "Not really worth watching." }
    ],
    "Worth Time": [
      { min: 0, max: 30, msg: "This video is likely a waste of your time." },
      { min: 31, max: 60, msg: "This video might be okay, but probably not worth much time." }
    ],
    "Mental Health Effect": [
      { min: -100, max: -30, msg: "This video might not be good for your mental health." }
    ],
    "Overall Score": [
      { min: 0, max: 30, msg: "Overall: Not recommended." }
    ]
  };

  const getMsg = (key) => {
    const val = parseInt(parsed[key] || 0, 10);
    return ranges[key]?.find(r => val >= r.min && val <= r.max)?.msg ?? undefined;
  };

  return `
    <dialog open style="z-index: 9999;align-self: anchor-center;font-size: x-large;">
      <h3>Hey...</h3>
      <ul>
        ${Object.keys(ranges).map(k => `<li>${getMsg(k) || ""}</li>`).join("")}
      </ul>
      <h4>You should probably avoid this video.</h4>
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
