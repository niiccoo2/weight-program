<script lang="ts">
	import { onMount } from 'svelte';
	let weightTextValue = $state('');
	let weightValue = $state(0);
	let leaderboard: Weight[] = [];

	interface Weight {
		name: string;
		weight: number;
		time: number;
		scale_id: string;
		auth_id: string;
	}

	async function readWeights() {
		const response = await fetch('/api/get', {
			method: 'GET',
			headers: {
				'content-type': 'application/json'
			}
		});

		// console.log(await response.json());
		return await response.json();
	}

	async function saveWeight() {
		const response = await fetch('/api/save', {
			method: 'POST',
			body: JSON.stringify({ name: 'test', weight: 1, time: 20, scale_id: 123, auth_id: 123 }),
			headers: {
				'content-type': 'application/json'
			}
		});

		console.log(await response.json());
		// weightValue = await response.json();
	}

	function cleanWeights(weights: Weight[]): Weight[] {
		let newList: Weight[] = [];

		for (let weight of weights) {
			const isThere = (element) => element === weight;
			let index = newList.findIndex(isThere);
			if (index !== -1) {
				// if is there
				newList[index].weight += weight.weight;
			} else {
				// if not there
				newList.push(weight);
			}
		}

		return newList;
	}

	function calcTotal(weights: Weight[]) {
		let sum: number = 0;
		for (let weight of weights) {
			sum += weight.weight;
		}
		console.log(sum);
	}

	onMount(() => {
		const sendButton = document.getElementById('send-button');
		const readButton = document.getElementById('read-button');

		if (sendButton)
			sendButton.addEventListener('click', async () => {
				saveWeight();
			});

		let rawWeights: Weight[] = [];

		if (readButton)
			readButton.addEventListener('click', async () => {
				rawWeights = await readWeights();
				console.log('RAW', rawWeights);
				leaderboard = cleanWeights(rawWeights);
				console.log('LEADERBOARD', leaderboard);
			});
	});
</script>

<input bind:value={weightTextValue} />

<p>{weightTextValue}</p>

<button id="send-button">SEND WEIGHT</button>
<button id="read-button">READ WEIGHTS</button>

<style>
</style>
