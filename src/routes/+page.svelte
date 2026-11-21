<script lang="ts">
	/// <reference types="w3c-web-serial" />
	import { onMount } from 'svelte';

	function delay(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	onMount(() => {
		const button = document.getElementById('main-button');
		let port = null;

		async function openPort(baudRate: number = 9600) {
			const newPort = await navigator.serial.requestPort();
			await newPort.open({ baudRate: baudRate });
			console.log('Returning new port');
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
						console.log(value);
						const string = new TextDecoder().decode(value);
						console.log(string);
						reader.releaseLock();
						return value;
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

		async function readWeight(port) {
			while (true) {
				// first send the command

				await sendWeightCommand(port);

				// then read the response

				let response = await readData(port);

				await delay(1000);
			}
		}

		if (button) {
			button.addEventListener('click', async () => {
				port = await openPort();
				readWeight(port);
			});
		}
	});
</script>

<button id="main-button">CLICK ME</button>
