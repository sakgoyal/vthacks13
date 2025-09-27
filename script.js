const DELIMITER = "\n".charCodeAt(0);

navigator.serial.addEventListener("disconnect", () => {
	location.reload();
});

document.onclick = async () => {
	// TODOOOOOO
	window.serialEnd = true;

	const port = await navigator.serial.requestPort().catch(error => {
		console.log(error);
	});

	await port.open({ baudRate: 9600 }).catch(() => {
		port.close();
	});

	if (!port.readable) return;

	//document.onclick = null;
	//TODOOOOO
	document.onclick = () => window.serialEnd = true;

	const reader = port.readable.getReader();

	let output = [];

	while (true) {
		const { value } = await reader.read();

		if (value) {
			output.push(...Array.from(value));

			let commandCount = 0;
			for (let i = 0; i < output.length; i++) {
				if (output[i] === DELIMITER) {
					commandCount++;
				}
			}

			for (let i = 0; i < commandCount; i++) {
				let commandBytes = [];

				let commandByte = null;
				while (commandByte = output.shift()) {
					if (commandByte === DELIMITER) {
						processCommand(commandBytes);

						break;
					} else {
						commandBytes.push(commandByte);
					}
				}
			}
		}

		// TODOOOOOO
		if (serialEnd) {
			const startElements = document.getElementsByClassName("startContent");
			for (const element of startElements) {
				element.style.display = "none";
			}

			await fakeLoading(1250);

			startMain();

			return;
		}
	}
};

function processCommand(command) {
	console.log(command); return
	const bytes = new Uint8Array(command);
	const view = new DataView(bytes.buffer);

	const value = view.getUint16(0, true); // false → big-endian
	console.log(value);

	if (1) {
	}
}

async function fakeLoading(time) {
	const spinner = document.getElementById("spinner");

	document.body.style.backgroundImage = "url('background-loading.svg')";
	spinner.style.display = "block";

	await new Promise(resolve =>
		setTimeout(() => resolve(), time)
	);

	spinner.style.display = "none";
	document.body.style.backgroundImage = "url('background-main.svg')";
}

function startMain() {
	const mainContentElements = document.getElementsByClassName("mainContent");
	for (const element of mainContentElements) {
		element.style.display = "block";
	}

	import("./startMain.js");
}

window.data = {
	sleepQuality: [],
	dayQuality: [],

	unhealthyFood: [],
	doomScrolling: [],
	drankCaffeine: [],
	YTdata: await fetch("https://vthacks13.saksham.dev/getAllData")
  .then(res => res.json())
  .then(data => {
	console.log("Fetched YT data:", data);
    for (const key in data) {
      if (data[key].analysis) {
        try {
          data[key].analysis = JSON.parse(data[key].analysis);
        } catch {
          data[key].analysis = {};
        }
      }
    }
    return data;
  })
  .catch(() => ({})),
};
