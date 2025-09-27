const dateRangeArray = ["Week", "Month", "Year"];
let dateIndex = 0;
const dateText = document.getElementById("dateText");
dateText.innerText = dateRangeArray[dateIndex];
dateLeftContainer.onclick = () => {
    dateIndex -= 1;

    if (dateIndex < 0) {
        dateIndex = dateRangeArray.length - 1;
    }

    dateText.innerText = dateRangeArray[dateIndex];

    updateChart();
}
dateRightContainer.onclick = () => {
    dateIndex = (dateIndex + 1) % dateRangeArray.length;

    dateText.innerText = dateRangeArray[dateIndex];

    updateChart();
}

let chart = null;
window.updateChart = function () {
    chart && chart.destroy();

    const dayCount = [7, 30, 365][dateIndex];
    const dataCopy = structuredClone(data);
    let filteredData = {
        sleepQuality: [],
        dayQuality: [],

        unhealthyFood: [],
        doomScrolling: [],
        drankCaffeine: [],
    };


    if (dateIndex === 2) {
        const newData = {
            sleepQuality: [],
            dayQuality: [],

            unhealthyFood: [],
            doomScrolling: [],
            drankCaffeine: [],
        };

        for (const dataName of Object.keys(newData)) {
            for (let i = 0; i < 8; i++) {
                let sum = 0;

                for (let j = 0; j < 30; j++) {
                    const value = dataCopy[dataName].shift();
                    sum += value.score;
                }

                const monthAverage = sum / 30;
                newData[dataName].push({ day: i, score: monthAverage });
            }
        }

        filteredData = newData;
    } else {
        let day = 0;
        while (day < dayCount) {
            const dataPoint = dataCopy.sleepQuality.pop();

            if (!dataPoint) break;

            filteredData.sleepQuality.unshift(dataPoint);

            day++;
        }


        const dataNames = Object.keys(filteredData).filter(name => name !== "sleepQuality");
        const statisticStartTime = filteredData.sleepQuality[0].day;

        for (const dataName of dataNames) {
            for (const dataPoint of data[dataName]) {
                if (dataPoint.day >= statisticStartTime) {
                    filteredData[dataName].push(dataPoint);
                }
            }
        }
    }

    let sum1 = 0;
    for (const dataPoint of filteredData.dayQuality) {
        sum1 += dataPoint.score;
    }
    let num1 = 0;
    const int1 = setInterval(() => {
        num1 += sum1 / 50;
        avgMood.innerText = Math.round(num1 / filteredData.dayQuality.length * 10) / 10;
    }, 10);
    setTimeout(() => {
        clearInterval(int1);
        avgMood.innerText = Math.round(sum1 / filteredData.dayQuality.length * 10) / 10;
    }, 500);
    let sum2 = 0;
    for (const dataPoint of filteredData.sleepQuality) {
        sum2 += dataPoint.score;
    }
    let num2 = 0;
    const int2 = setInterval(() => {
        num2 += sum2 / 75;
        avgSleep.innerText = Math.round(num2 / filteredData.sleepQuality.length * 10) / 10;
    }, 10);
    setTimeout(() => {
        clearInterval(int2);
        avgSleep.innerText = Math.round(sum2 / filteredData.sleepQuality.length * 10) / 10;
    }, 750);
    let sum3 = 0;
    let length = 0;
    for (const name of ["unhealthyFood", "doomScrolling", "drankCaffeine"]) {
        for (const stat of filteredData[name]) {
            sum3 += stat.score;
        }
        length += filteredData[name].length;
    }
    let num3 = 0;
    const int3 = setInterval(() => {
        num3 += sum3 / 100;
        avgUnhealthyHabits.innerText = Math.round(num3 / length * 10) / 10;
    }, 10);
    setTimeout(() => {
        clearInterval(int3);
        avgUnhealthyHabits.innerText = Math.round(sum3 / length * 10) / 10;
    }, 1000);


    const timeAxis = [
        ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        [...Object.keys(new Array(31 + 1).fill())].slice(1),
        ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    ][dateIndex];

    const timeAxisLabel = [
        "Day of the Week",
        "Days of September",
        "Time of Year",
    ][dateIndex];

    chart = new Chart(
        document.getElementById("mainGraph"),
        {
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        ticks: {
                            stepSize: 1,
                            callback: function (value) {
                                return timeAxis[value];
                            }
                        },
                        title: {
                            display: true,
                            text: timeAxisLabel,
                        }
                    },
                    y: {
                        min: 0,
                        max: 5,
                        title: {
                            display: true,
                            text: "Score",
                        },
                    },
                },
            },
            type: 'line',
            data: {
                labels: timeAxis,
                datasets: [
                    {
                        label: 'Sleep (1-5)',
                        data: filteredData.sleepQuality.map(e => {
                            return {
                                x: 0,
                                y: e.score,
                            };
                        }),
                    },
                    {
                        label: 'Mood (1-5)',
                        data: filteredData.dayQuality.map(o => {
                            return {
                                x: 0,
                                y: o.score,
                            };
                        }),
                    },
                    {
                        type: "bar",
                        label: 'Unhealthy Food',
                        data: filteredData.unhealthyFood.map(o => {
                            return {
                                x: 0,
                                y: o.score,
                            };
                        }),
                    },
                    {
                        type: "bar",
                        label: 'Doomscrolling',
                        data: filteredData.doomScrolling.map(o => {
                            return {
                                x: 0,
                                y: o.score,
                            };
                        }),
                    },
                    {
                        type: "bar",
                        label: 'Caffeine',
                        data: filteredData.drankCaffeine.map(o => {
                            return {
                                x: 0,
                                y: o.score,
                            };
                        }),
                    },
                ]
            }
        }
    );
};

updateChart();

async function getGeminiAnalysis() {
    const GEMINI_API_KEY = "AIzaSyC9FTM5HdsZcpUKn1G_lAhKGRNU7lM4_1s";
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;
    console.warn("--- fetching gemini analysis ---");
    console.warn(window.data);
    const res = await fetch(GEMINI_API_URL, {method: "POST", headers: {"Content-Type": "application/json","x-goog-api-key": GEMINI_API_KEY},
        body: JSON.stringify({
            "contents": [{
                "parts":[
                    {"text": "Here is some data about a person's habits and lifestyle:\n"},
                    {"text": `\nHere is the sleep quality data:\n${JSON.stringify(window.data.sleepQuality)}` },
                    {"text": `\nHere is the day quality data:\n${JSON.stringify(window.data.dayQuality)}` },
                    {"text": `\nHere is the unhealthy food consumption data:\n${JSON.stringify(window.data.unhealthyFood)}` },
                    {"text": `\nHere is the doomscrolling data:\n${JSON.stringify(window.data.doomScrolling)}` },
                    {"text": `\nHere is the caffeine consumption data:\n${JSON.stringify(window.data.drankCaffeine)}` },
                    {"text": `\nHere is the YouTube viewing data:\n${JSON.stringify(window.data.YTdata)}` },
                    {"text": "\nPlease analyze the data and provide insights on how these habits might be affecting their overall well-being. Offer suggestions for improvement where applicable."},
                    {"text": "\nsleepQuality is an array of objects with day (0-indexed) and score (1-5) representing sleep quality over time.\n"},
                    {"text": "\ndayQuality is representing overall mood and well-being over time.\n"},
                    {"text": "\nunhealthyFood is an array of objects with day (0-indexed) and score (count) representing the number of unhealthy food items consumed over time.\n"},
                    {"text": "\ndoomScrolling is representing the amount of time spent doomscrolling over time.\n"},
                    {"text": "\ndrankCaffeine is representing the number of caffeinated drinks consumed over time.\n"},
                    {"text": "\nYTdata is an object where each key is a ISO date string and each value is an object containing details about a YouTube video the user attempted to watch\n"},
                    {"text": "\nAnalyze correlations between these habits and provide actionable insights. Suggest lifestyle changes to improve overall well-being."},
                ]
            }],
        }),
    })
    .then((response) => response.json())
    .then((result) => result);
    console.warn("--- fetched gemini analysis ---");
    return res;
}

console.log(await getGeminiAnalysis());
