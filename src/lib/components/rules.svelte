<script>
	import { LETTER_STARTING_HEALTH } from '$lib/config';
	import { gameContext } from '$lib/contexts.svelte';

	const gameState = gameContext.getEssential();
</script>

<div class="root">
	<div class="content">
		<div class="nes-container is-rounded">
			Try to find words that uses the same letters as the target word. Any unused letters take
			damage, once a letter takes {LETTER_STARTING_HEALTH} damage you can't use it anymore. Submitting
			a word extends the timer. Try to submit as many words as you can before time runs out!
		</div>
		<button class="nes-btn is-primary" onclick={() => gameState.beginGame()}>Start</button>
	</div>
</div>

<style>
	.root {
		display: flex;
		align-items: center;
		justify-content: center;

		height: calc(var(--vh) * 100);
		width: 100vw;

		padding: 16px;
	}

	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
	}
</style>
