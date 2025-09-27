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

// TODOOOO this is example data
// starts at January 1, 2025 12:00:00 AM

function getRandom(min, maxExcluded) {
    const r = Math.random();
    return Math.floor(r * maxExcluded) + min;
}

// fill test data for 270 days
for (let i = 0; i < 270; i++) {
    data.sleepQuality.push({
        day: i,
        score: getRandom(0, 2) + ((i + 4) % 7 < 2 ? 3 : 0),
    });

    const unhealthyFoodCount = getRandom(0, Math.round(Math.sin(Math.PI * i / 365) * 5));
    data.unhealthyFood.push({ day: i, score: unhealthyFoodCount });

    const dayQuality = getRandom(1, 5) - getRandom(0, unhealthyFoodCount + 1);
    data.dayQuality.push({
        day: i,
        score: dayQuality,
    });


    const doomScrollingCount = Math.max(getRandom(2, 3) - getRandom(0, dayQuality), 0);
    data.doomScrolling.push({ day: i, score: doomScrollingCount });

    const drankCaffeineCount = getRandom(0, 2);
    data.drankCaffeine.push({ day: i, score: drankCaffeineCount });
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
                newData[dataName].push({ day: i, score: monthAverage })
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

    function toTimeAxis(time) {
    }

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
                                console.log(value)
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
