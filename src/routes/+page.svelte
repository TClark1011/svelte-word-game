<script lang="ts">
	import EndScreen from '$lib/components/end-screen.svelte';
	import Game from '$lib/components/game.svelte';
	import { gameContext } from '$lib/contexts.svelte';
	import { GameState } from '$lib/game-state.svelte';

	let { data } = $props();

	const gameState = new GameState(data.wordIndex);
	gameContext.set(gameState);
</script>

{#if !gameState.gameOver}
	<Game />
{:else}
	<EndScreen />
{/if}
