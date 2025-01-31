<script lang="ts">
	import { LETTER_STARTING_HEALTH, WORDS } from '$lib/config';
	import { gameState, type GameState } from '$lib/game-state.svelte';
	import { letters } from '$lib/misc-constants';
	import { basicNumberArray } from '$lib/utils';
	import cx from 'classnames';
	import { onMount } from 'svelte';

	let { data } = $props();

	// Only render the game on the client
	let localTargetWord = $state(WORDS[data.wordIndex]);
	onMount(() => {
		gameState.useWordAtIndex(data.wordIndex);
	});

	$effect(() => {
		localTargetWord = gameState.targetWord;
	});

	$effect(() => {
		let timeLimitTimeout = setTimeout(() => {
			gameState.endGame();
		}, gameState.timeLeftMs);

		return () => clearTimeout(timeLimitTimeout);
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
					<div
						class={cx(
							'flex',
							gameState.previouslyDamagedLetters.includes(letter) && 'damaged-health'
						)}
					>
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
					{#each localTargetWord.split('') as letter}
						<div class="flex h-8 w-8 items-center justify-center font-mono text-4xl font-bold">
							<div>{letter.toUpperCase()}</div>
						</div>
					{/each}
				</div>

				<!-- Progress Bar -->
				{#key localTargetWord}
					<div
						id="progress"
						class="h-2 w-48 bg-black"
						style="--time-left: {gameState.timeLeftMs}ms"
					></div>
				{/key}
			</div>

			<!-- Input -->
			<form
				onsubmit={(e) => {
					e.preventDefault();
					gameState.submitWord();
				}}
				class="flex items-center justify-center py-16"
			>
				<input
					type="text"
					class={cx(
						'rounded-md border-2 p-4 text-lg',
						!!gameState.wordSubmissionError && 'border-red-500 text-red-500'
					)}
					bind:value={() => gameState.inputValue, (v) => gameState.setInputValue(v)}
				/>
			</form>
		</div>
	</div>
{/if}

<style>
	@keyframes shakeX {
		/* Source: https://github.com/animate-css/animate.css/blob/main/source/attention_seekers/shakeX.css */
		from,
		to {
			transform: translate3d(0, 0, 0);
		}

		10%,
		30%,
		50%,
		70%,
		90% {
			transform: translate3d(-10px, 0, 0);
		}

		20%,
		40%,
		60%,
		80% {
			transform: translate3d(10px, 0, 0);
		}
	}

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

	.damaged-health {
		animation: shakeX 200ms linear;
		animation-fill-mode: forwards;
	}
</style>
