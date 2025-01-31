import { composeContextHelpers } from '$lib/context-helpers.svelte';
import { GameState } from '$lib/game-state.svelte';

export const gameContext = composeContextHelpers<GameState>('game');
