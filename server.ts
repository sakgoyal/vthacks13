import { Innertube, Log } from 'npm:youtubei.js@latest'

Log.setLevel(Log.Level.WARNING);
const yt = await Innertube.create({ cookie: "GPS=1; YSC=Cmpl8SLoX6s; VISITOR_INFO1_LIVE=yFbjqy-4xME; VISITOR_PRIVACY_METADATA=CgJVUxIEGgAgEg%3D%3D; PREF=f6=40000000&tz=America.New_York; __Secure-ROLLOUT_TOKEN=CI7x08_-kZ6wLRCUtc6QuPmPAxiNy5KRuPmPAw%3D%3D; CONSISTENCY=AKreu9s08drN0WPbbyNg9Kg03yTL-aRUGrOyT4otwuPm9LryVhu6Sc7O-e7FeXm3XbKFRSvakb4VYTIRVoCa-NqeK2QAZcBJVswRXijLAygisDdpn0pIR86yEQ; ST-1dxar9p=itct=CAAQwrECIhMIq73qnLj5jwMVRApoCB3A8ATlmgECCDrKAQQuCAPL&csn=kdkVasqD3MSFMPZJ&endpoint=%7B%22clickTrackingParams%22%3A%22CAAQwrECIhMIq73qnLj5jwMVRApoCB3A8ATlmgECCDrKAQQuCAPL%22%2C%22commandMetadata%22%3A%7B%22webCommandMetadata%22%3A%7B%22url%22%3A%22%2Fshorts%2FZOSY4GB0ipY%22%2C%22webPageType%22%3A%22WEB_PAGE_TYPE_SHORTS%22%2C%22rootVe%22%3A37414%7D%7D%2C%22reelWatchEndpoint%22%3A%7B%22videoId%22%3A%22ZOSY4GB0ipY%22%2C%22playerParams%22%3A%228AEByAMTuAQPogYVAfSZbRRJ32Fr9NQv7SSMtLPb4hhKkAcC%22%2C%22thumbnail%22%3A%7B%22thumbnails%22%3A%5B%7B%22url%22%3A%22https%3A%2F%2Fi.ytimg.com%2Fvi%2FZOSY4GB0ipY%2Fframe0.jpg%22%2C%22width%22%3A1080%2C%22height%22%3A1920%7D%5D%2C%22isOriginalAspectRatio%22%3Atrue%7D%2C%22overlay%22%3A%7B%22reelPlayerOverlayRenderer%22%3A%7B%22style%22%3A%22REEL_PLAYER_OVERLAY_STYLE_SHORTS%22%2C%22trackingParams%22%3A%22CCYQsLUEIhMIq73qnLj5jwMVRApoCB3A8ATl%22%2C%22reelPlayerNavigationModel%22%3A%22REEL_PLAYER_NAVIGATION_MODEL_UNSPECIFIED%22%7D%7D%2C%22params%22%3A%22CA8wAroBGFVDQVV6X2ZSMlEyVUtqV09XLTJTODJrUQ%253D%253D%22%2C%22loggingContext%22%3A%7B%22vssLoggingContext%22%3A%7B%22serializedContextData%22%3A%22CgIIDA%253D%253D%22%7D%2C%22qoeLoggingContext%22%3A%7B%22serializedContextData%22%3A%22CgIIDA%253D%253D%22%7D%7D%2C%22ustreamerConfig%22%3A%22CAw%3D%22%2C%22sequenceParams%22%3A%22GnEKC1pPU1k0R0IwaXBZGAAgATCA4Muc3PWBsM0BQlMIABAgGjXyBjIKMAoFmgECEAEYASICIAHqxO-8CxUSEwirveqcuPmPAxVECmgIHcDwBOXqusrzDQIIDyIHCgUzMjpTSCoNCgtaT1NZNEdCMGlwWSoCGA9CAGIEUkRTSA%253D%253D%22%7D%7D"});

async function getTranscript(videoID: string) {

  const scriptInfo = await (await yt.getInfo(videoID)).getTranscript()
  return scriptInfo?.transcript?.content?.body?.initial_segments.reduce((acc, segment) => {
    acc += segment.snippet.text + ' '
    return acc
  }, '')
}

Deno.serve({port: 8000}, async (req: Request) => {
  const url = new URL(req.url).pathname.split("/")[1];
  if (!url) {
    return new Response("No URL provided", { status: 400 });
  }
  const transcript = await getTranscript(url);

  const GEMINI_API_KEY = "AIzaSyC9FTM5HdsZcpUKn1G_lAhKGRNU7lM4_1s";
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

  const res: string = await fetch(GEMINI_API_URL, {method: "POST",headers: {"Content-Type": "application/json","x-goog-api-key": GEMINI_API_KEY},
          body: JSON.stringify({
        "contents": [{
          "parts":[
              {"text": "Below is the transcript for a youtube video. What kind of video is this? think about if this video is educational, entertaining, technical, feel good, gaming, video essays, excessively long videos, other categories that are common on youtube. Is this video actually worth watching, worth the time, worth the mental health effects. then end with a simple score of 0-100 of worth watching or not. make sure to ignore any ads or promotional content and only focus on the actual content of the video."},
              {"text": transcript },
              {"text": "Output formatting notes:make sure the scale is just the number. no additional text describing the score or anything. no need to mention the scale. just the plain number and nothing else" },
          ]
        }],
        "generationConfig": {
    "responseMimeType": "application/json",
    "responseSchema": {
      "type": "OBJECT",
      "properties": {
        "Worth Watching": { "type": "NUMBER" },
        "Worth Time": { "type": "NUMBER" },
        "Mental Health Effect": { "type": "NUMBER" },
        "Overall Score": { "type": "NUMBER" }
      },
      "required": ["Worth Watching", "Worth Time", "Mental Health Effect", "Overall Score"],
      "propertyOrdering": ["Worth Watching", "Worth Time", "Mental Health Effect", "Overall Score"]
    }
  }
      }),
      })
      .then((response) => response.json())
      .then((result) => result["candidates"][0]["content"]["parts"][0]["text"]);
  return new Response(res);
});
