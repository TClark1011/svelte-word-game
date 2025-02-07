<script lang="ts">
	import { dev } from '$app/environment';
	import EndScreen from '$lib/components/end-screen.svelte';
	import Game from '$lib/components/game.svelte';
	import Rules from '$lib/components/rules.svelte';
	import { gameContext } from '$lib/contexts.svelte';
	import { GameState } from '$lib/game-state.svelte';

	let { data } = $props();

	const gameState = new GameState(data.wordIndex);
	gameContext.set(gameState);
</script>

{#if dev}
	<!-- Load the dev panel in  -->
	{#await import('$lib/components/dev-panel.svelte').then(r => r.default) then DevPanel}
		<DevPanel />
	{/await}
{/if}

{#if gameState.mode === 'rules'}
	<Rules />
{:else if gameState.mode === 'game'}
	<Game />
{:else if gameState.mode === 'end'}
	<EndScreen />
{/if}
