<script lang="ts">
	import Keyboard from '$lib/components/keyboard.svelte';
	import { LETTER_STARTING_HEALTH, STARTING_TIME_MS } from '$lib/config';
	import { gameContext } from '$lib/contexts.svelte';
	import * as R from 'remeda';

	const gameState = gameContext.getEssential();

	$effect(() => {
		// End the game when time runs out
		let timeSinceLastSubmit = new Date().getTime() - gameState.lastSubmitAtMs;
		let timeLimitTimeout = setTimeout(() => {
			gameState.endGame();
		}, gameState.timeLeftMs - timeSinceLastSubmit);

		return () => clearTimeout(timeLimitTimeout);
	});

	let progressBarWidth = $derived.by(() => {
		const progressBarBaseWidth = 192;
		const percentageTimeRemaining = Math.min(gameState.timeLeftMs / STARTING_TIME_MS, 2);
		return progressBarBaseWidth * percentageTimeRemaining;
	});

	const LAST_WORDS_TO_SHOW = 5;
	let recentWords = $derived(
		R.pipe(gameState.submittedWords, R.reverse(), R.take(LAST_WORDS_TO_SHOW + 1))
	);
</script>

<div class="root">
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

		<div class="previous-words">
			{#each recentWords as word, i (word)}
				{@const isLastOfFull = recentWords.length > LAST_WORDS_TO_SHOW && i === LAST_WORDS_TO_SHOW}
				<div style:--index={i} class={['word', isLastOfFull && 'vanishing']}>{word}</div>
			{/each}
		</div>
	</div>

	<!-- Input -->
	<form
		onsubmit={(e) => {
			e.preventDefault();
			gameState.submitWord();
		}}
		class="bottom"
	>
		<!-- svelte-ignore a11y_autofocus -->
		<input
			type="text"
			class={['input nes-input', !!gameState.wordSubmissionError && 'is-error']}
			bind:value={gameState.inputValue}
			inputmode="none"
			autofocus
		/>
		<Keyboard
			letterHealth={gameState.letterHealth}
			maxLetterHealth={LETTER_STARTING_HEALTH}
			shouldBeDisabled={(key) => {
				if (key.case !== 'letter' && gameState.inputValue.length === 0) return true;
				if (key.case !== 'letter') return false;

				return gameState.letterIsDead(key.letter);
			}}
			onkey={(key) => {
				switch (key.case) {
					case 'letter':
						gameState.sendLetter(key.letter);
						break;
					case 'backspace':
						gameState.backspace();
						break;
					case 'enter':
						gameState.submitWord();
						break;
				}
			}}
		/>
	</form>
</div>

<style>
	@keyframes progress {
		from {
			transform: scaleX(1);
		}
		to {
			transform: scaleX(0);
		}
	}

	.root {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: center;

		width: 100vw;
		height: 100vh;
	}

	.top {
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

	.previous-words {
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		margin-top: 16px;
	}

	.previous-words .word {
		position: absolute;
		text-align: center;
		opacity: 0.5;
		transform: translateY(calc(var(--index) * 32px));

		transition:
			transform 0.5s,
			opacity 0.5s;
	}

	.previous-words .word.vanishing {
		opacity: 0;
	}

	.bottom {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
		width: 100%;

		padding-bottom: 32px;
	}

	.input {
		width: 100%;
		max-width: 24rem;
		font-size: 16px;
		outline: none;
	}

	.input.is-error {
		color: #ce372b; /* Same color used in NES.css */
	}
</style>
