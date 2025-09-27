import { Innertube, Log } from 'youtubei.js'

Log.setLevel(Log.Level.WARNING);
const yt = await Innertube.create({});
const allData: Record<string, object> = {};
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
  if (url == "getAllData") {
    const header = new Headers();
    header.append("Access-Control-Allow-Origin", "*");
    return new Response(JSON.stringify(allData), { status: 200, headers: header });
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
      allData[new Date().toISOString()] = {videoID: url, analysis: res};
  return new Response(res);
});
