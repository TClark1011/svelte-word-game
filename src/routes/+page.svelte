<script lang="ts">
	import { LETTER_STARTING_HEALTH } from '$lib/config';
	import { gameState, gameStateDispatch, type GameState } from '$lib/game-state.svelte';
	import { letters } from '$lib/misc-constants';
	import { basicNumberArray } from '$lib/utils';
	import cx from 'classnames';

	// Only render the game on the client
	let currentWord = $state('');
	$effect(() => {
		currentWord = gameState.currentWord;
	});

	const applyTimeout = (getGameState: () => GameState) => {
		const state = getGameState();

		return setTimeout(() => {
			gameStateDispatch({
				type: 'game-over'
			});
		}, state.timeLeftMs);
	};

	let timeout = setTimeout(() => {});
	$effect(() => {
		clearTimeout(timeout);
		timeout = applyTimeout(() => gameState);
	});
</script>

{#if gameState.gameOver === true}
	<div class="flex h-screen w-screen items-center justify-center">
		<div class="text-4xl">Game Over</div>
	</div>
{:else}
	<div class="flex h-screen w-screen">
		<!-- Letter Health Sidebar -->
		<div class="flex h-full flex-shrink-0 flex-col justify-between pl-2">
			{#each letters as letter}
				<div class="flex">
					<div class="mr-2">
						{letter}
					</div>
					<div class="flex">
						{#each basicNumberArray(LETTER_STARTING_HEALTH) as i}
							<i
								class={cx(
									'nes-icon heart',
									(gameState.letterHealth[letter] ?? 0) < i + 1 && 'is-empty'
								)}
							></i>
						{/each}
					</div>
				</div>
			{/each}
		</div>

		<div class="flex h-full w-full flex-col items-center justify-between">
			<!-- Current Word -->
			<div class="flex h-36 w-full flex-col items-center justify-center gap-2">
				<div class="flex">
					{#each currentWord.split('') as letter}
						<div class="flex h-8 w-8 items-center justify-center font-mono text-4xl font-bold">
							<div>{letter.toUpperCase()}</div>
						</div>
					{/each}
				</div>

				<!-- Progress Bar -->
				{#if currentWord}
					<div
						id="progress"
						class="h-2 w-48 bg-black"
						style="--time-left: {gameState.timeLeftMs}ms"
					></div>
				{/if}
			</div>

			<!-- Input -->
			<form
				onsubmit={(e) => {
					e.preventDefault();
					gameStateDispatch({
						type: 'submit-word'
					});
				}}
				class="flex items-center justify-center py-16"
			>
				<input
					type="text"
					class={cx(
						'rounded-md border-2 p-4 text-lg',
						(gameState.error === 'invalid-word-submission' ||
							gameState.error === 'already-used-word' ||
							gameState.error === 'dead-letter-used') &&
							'border-red-500 text-red-500'
					)}
					bind:value={gameState.inputValue}
				/>
			</form>
		</div>
	</div>
{/if}

<style>
	@keyframes progress {
		from {
			transform: scaleX(1);
		}
		to {
			transform: scaleX(0);
		}
	}

	#progress {
		animation: progress var(--time-left) linear;
		animation-fill-mode: forwards;
	}
</style>
