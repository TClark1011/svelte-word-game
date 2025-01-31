<script lang="ts">
	import Game from '$lib/components/game.svelte';
	import { gameContext } from '$lib/contexts.svelte';
	import { GameState } from '$lib/game-state.svelte';

	let { data } = $props();

	gameContext.set(new GameState(data.wordIndex));
</script>

<Game />
