<script lang="ts">
	/// <reference types="w3c-web-serial" />
	import { onMount } from 'svelte';

	let weight = $state(0);

	function delay(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	onMount(() => {
		const button = document.getElementById('main-button');
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

		async function sendWeightCommand(port) {
			const encoder = new TextEncoder();
			const writer = port.writable.getWriter();
			await writer.write(encoder.encode('W'));
			writer.releaseLock();
		}

		function parseWeightString(weightString: string): number {
			const commaCheck = weightString.split(',').length - 1;

			if (commaCheck === 3) {
				// If we have a proper string

				return Number(weightString.split(',')[0]);
			} else {
				console.log("Didn't get 3 commas, returning 0.");
				return 0;
			}

			return 0;
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

		if (button) {
			button.addEventListener('click', async () => {
				port = await openPort();

				while (true) {
					weight = await readWeight(port);
					console.log(weight);
					await delay(800);
				}
			});
		}
	});
</script>

<button id="main-button">CLICK ME</button>
<p>{weight}</p>
