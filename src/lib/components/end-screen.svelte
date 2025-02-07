<script lang="ts">
	import { gameContext } from '$lib/contexts.svelte';

	const gameState = gameContext.getEssential();
</script>

<div class="root">
	<div class="content">
		<h1>Game Over</h1>
		<div class="nes-container is-rounded">Score: {gameState.submittedWords.length}</div>
		<button class="nes-btn is-primary" onclick={() => gameState.restartGame()}>Try Again</button>
		{#if gameState.submittedWords.length > 0}
			<div class="used-words nes-container is-rounded">
				{#each gameState.submittedWords as word, i (word)}
					<div style:--index={i}>{word}</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.root {
		display: flex;
		align-items: center;
		justify-content: center;

		width: 100vw;
		height: 100vh;
	}

	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
	}

	.used-words {
		display: flex;
		flex-direction: column;
		gap: 8px;
		max-height: 400px;
		overflow-y: auto;
	}
</style>
