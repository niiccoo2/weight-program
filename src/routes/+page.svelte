<script lang="ts">
	import { onMount } from 'svelte';
	let weightTextValue = $state('');
	let nameValue = $state('');
	let weightValue = $state(0);
	let weight = $state(0);
	let weirdScale = $state(false);

	interface Weight {
		name: string;
		weight: number;
		time: number;
		scale_id: string;
		auth_id: string;
	}

	async function saveWeight() {
		const d = new Date();
		const response = await fetch('/api/save', {
			method: 'POST',
			body: JSON.stringify({
				name: nameValue,
				weight: weight,
				time: d.getTime(),
				scale_id: 0,
				auth_id: 0
			}),
			headers: {
				'content-type': 'application/json'
			}
		});

		console.log(await response.json());
		// weightValue = await response.json();
	}

	onMount(() => {
		const sendButton = document.getElementById('send-button');

		if (sendButton)
			sendButton.addEventListener('click', async () => {
				saveWeight();
			});
		const openButton = document.getElementById('open-button');
		const tareButton = document.getElementById('tare-button');
		let port = null;

		async function openPort(baudRate: number = 9600) {
			const newPort = await navigator.serial.requestPort();
			await newPort.open({ baudRate: baudRate });
			console.debug('Returning new port');
			return newPort;
		}

		async function readData(port) {
			while (port.readable) {
				const reader = port.readable.getReader();
				try {
					while (true) {
						const { value, done } = await reader.read();
						if (done) {
							// |reader| has been canceled.
							break;
						}
						const string = new TextDecoder().decode(value);

						console.debug(value);
						console.debug(string);

						reader.releaseLock();
						return string;
					}
				} catch (error) {
					// Handle |error|…
				} finally {
					reader.releaseLock();
				}
			}
		}

		async function sendWeightCommand(port, cmd: string = 'W') {
			const encoder = new TextEncoder();
			const writer = port.writable.getWriter();
			await writer.write(encoder.encode(cmd));
			writer.releaseLock();
		}

		function parseWeightString(weightString: string): number {
			// const commaCheck = weightString.split(',').length - 1;

			// if (commaCheck === 3) {
			// If we have a proper string

			return Number(weightString.split(',')[0]);
			// } else {
			// console.log("Didn't get 3 commas, returning 0.");
			// return 0;
			// }

			return 0;
		}

		async function tareScale(port) {
			await sendWeightCommand('x');
			await delay(1000);
			await sendWeightCommand('1');
			await delay(5000);
			await sendWeightCommand('x');
			await delay(1000);
		}

		async function readWeight(port) {
			// first send the command
			await sendWeightCommand(port);

			// then read the response
			const response = await readData(port);

			if (response) {
				return parseWeightString(response);
			} else {
				console.error("Didn't get a response, returning 0.");
				return 0;
			}
		}

		if (openButton) {
			openButton.addEventListener('click', async () => {
				port = await openPort();

				// if (weirdScale) sendWeightCommand('x');

				while (true) {
					weight = await readWeight(port);
					console.log(weight);
					await delay(800);
				}
			});
		}

		if (tareButton) {
			tareButton.addEventListener('click', async () => {
				port = await openPort();
				tareScale(port);
			});
		}
	});

	function delay(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
</script>

<input bind:value={nameValue} />

<button id="send-button">SEND WEIGHT</button>
<button id="open-button">OPEN SCALE</button>
<button id="tare-button">TAR SCALE</button>

<p>Do you have a weird scale? <input bind:checked={weirdScale} type="checkbox" /></p>

<p>WEIGHT: {weight} lbs</p>
