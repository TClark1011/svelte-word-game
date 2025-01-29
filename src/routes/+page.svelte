<script lang="ts">
	import { LETTER_STARTING_HEALTH } from '$lib/config';
	import { gameState, gameStateDispatch } from '$lib/game-state.svelte';
	import { letters } from '$lib/misc-constants';
	import { basicNumberArray } from '$lib/utils';
	import cx from 'classnames';

	// Only render the game on the client
	let currentWord = $state('');
	$effect(() => {
		currentWord = gameState.currentWord;
	});
</script>

<div class="flex h-screen w-screen">
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
		<div class="flex h-36 w-full items-center justify-center">
			<div class="flex">
				{#each currentWord.split('') as letter}
					<div class="flex h-8 w-8 items-center justify-center font-mono text-4xl font-bold">
						<div>{letter.toUpperCase()}</div>
					</div>
				{/each}
			</div>
		</div>

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
					gameState.error === 'invalid-word-submission' && 'border-red-500 text-red-500'
				)}
				bind:value={gameState.inputValue}
			/>
		</form>
	</div>
</div>
