<script lang="ts">
	import { LETTER_STARTING_HEALTH, STARTING_TIME_MS } from '$lib/config';
	import { gameContext } from '$lib/contexts.svelte';
	import { letters } from '$lib/misc-constants';
	import { basicNumberArray } from '$lib/utils';
	import cx from 'classnames';

	const gameState = gameContext.getEssential();

	$effect(() => {
		let timeSinceLastSubmit = new Date().getTime() - gameState.lastSubmitAtMs;
		let timeLimitTimeout = setTimeout(() => {
			gameState.endGame();
		}, gameState.timeLeftMs - timeSinceLastSubmit);

		return () => clearTimeout(timeLimitTimeout);
	});

	const getLetterWasDamaged = (letter: string) =>
		gameState.previouslyDamagedLetters.includes(letter);

	const letterHeartIsEmpty = (letter: string, heartIndex: number) =>
		(gameState.letterHealth[letter] ?? 0) < heartIndex + 1;

	let progressBarWidth = $derived.by(() => {
		const progressBarBaseWidth = 192;
		const percentageTimeRemaining = Math.min(gameState.timeLeftMs / STARTING_TIME_MS, 2);
		return progressBarBaseWidth * percentageTimeRemaining;
	});
</script>

{#if gameState.gameOver === true}
	<div class="game-over-container">
		<div class="game-over-message">Game Over</div>
	</div>
{:else}
	<div class="root">
		<!-- Letter Health Sidebar -->
		<div class="sidebar">
			{#each letters as letter}
				<div class={cx('letter-health-row', getLetterWasDamaged(letter) && 'damaged')}>
					<div>
						{letter}
					</div>
					<div class="health-container">
						{#each basicNumberArray(LETTER_STARTING_HEALTH) as i}
							<i class={cx('nes-icon heart', letterHeartIsEmpty(letter, i) && 'is-empty')}></i>
						{/each}
					</div>
				</div>
			{/each}
		</div>

		<div class="main">
			<div class="top">
				<div class="target-word-container">
					{#each gameState.targetWord.split('') as letter}
						<div class="letter">
							{letter.toUpperCase()}
						</div>
					{/each}
				</div>

				{#key gameState.timeLeftMs}
					<div
						class="progress-bar"
						style:--time-left="{gameState.timeLeftMs}ms"
						style:--width="{progressBarWidth}px"
					></div>
				{/key}
			</div>

			<!-- Input -->
			<form
				onsubmit={(e) => {
					e.preventDefault();
					gameState.submitWord();
				}}
				class="bottom"
			>
				<input
					type="text"
					class={cx('input', !!gameState.wordSubmissionError && 'error')}
					bind:value={gameState.inputValue}
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

	.game-over-container {
		display: flex;
		justify-content: center;
		align-items: center;

		height: 100vh;
		width: 100vw;
	}

	.game-over-message {
		font-size: 64px;
	}

	.root {
		display: flex;
		width: 100vw;
		height: 100vh;
	}

	.sidebar {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		height: 100%;
		flex-shrink: 0;
		padding-left: 8px;
	}

	.letter-health-row {
		display: flex;
		gap: 8px;
	}

	.letter-health-row .health-container {
		display: flex;
	}

	.letter-health-row.damaged {
		animation: shakeX 200ms linear;
		animation-fill-mode: forwards;
	}

	.main {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: center;

		width: 100%;
		height: 100%;
	}

	.main .top {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 8px;

		height: 144px;
		width: 100%;
	}

	.target-word-container {
		display: flex;
	}

	.target-word-container .letter {
		display: flex;
		justify-content: center;
		align-items: center;

		--size: 32px;
		width: var(--size);
		height: var(--size);

		font-family: monospace;
		font-size: 32px;
		font-weight: bold;
	}

	.progress-bar {
		height: 8px;
		width: var(--width);
		background-color: black;

		animation: progress var(--time-left) linear;
		animation-fill-mode: forwards;
	}

	.main .bottom {
		display: flex;
		justify-content: center;
		align-items: center;

		--py: 64px;
		padding-top: var(--py);
		padding-bottom: var(--py);
	}

	.input {
		padding: 16px;
		border-radius: 16px;
		border: 2px solid gray;
		font-size: 16px;
	}

	.input.error {
		border-color: red;
		color: red;
	}
</style>
