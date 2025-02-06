<script lang="ts">
	import type { LetterHealthTracker } from '$lib/game-state.svelte';
	import { range } from '$lib/utils';

	type KeyEntry =
		| {
				case: 'letter';
				letter: string;
		  }
		| {
				case: 'enter' | 'backspace';
		  };

	type Props = {
		onkey?: (
			key: KeyEntry,
			event: MouseEvent & {
				currentTarget: EventTarget & HTMLButtonElement;
			}
		) => void;
		shouldBeDisabled?: (key: KeyEntry) => boolean;
		class?: string;
		letterHealth: LetterHealthTracker;
		maxLetterHealth: number;
	};

	const {
		onkey,
		class: classProp,
		shouldBeDisabled = () => false,
		letterHealth,
		maxLetterHealth
	}: Props = $props();

	const LETTER_ROWS: [string[], string[], string[]] = [
		['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
		['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
		['z', 'x', 'c', 'v', 'b', 'n', 'm']
	];
	const ROWS: KeyEntry[][] = [
		LETTER_ROWS[0].map((letter) => ({ case: 'letter', letter })),
		LETTER_ROWS[1].map((letter) => ({ case: 'letter', letter })),
		[
			{ case: 'backspace' },
			...LETTER_ROWS[2].map((letter): KeyEntry => ({ case: 'letter', letter })),
			{ case: 'enter' }
		]
	];
</script>

<div class={['keyboard', classProp]}>
	{#each ROWS as row, i}
		<div class="row" data-index={i}>
			{#each row as key}
				{@const isDisabled = shouldBeDisabled(key)}
				<button
					disabled={isDisabled}
					type="button"
					class={['key nes-btn', isDisabled && 'is-disabled']}
					onclick={(e) => onkey?.(key, e)}
					onmousedown={(e) => e.preventDefault()}
				>
					<div class="inner">
						<div class="letter">
							{#if key.case === 'letter'}
								{key.letter}
							{:else if key.case === 'backspace'}
								←
							{:else if key.case === 'enter'}
								↵
							{/if}
						</div>
					</div>
					{#if key.case === 'letter' && !isDisabled}
						<div
							class="health-bar"
							style:--health-percentage={(letterHealth[key.letter] / maxLetterHealth) * 100 + '%'}
						></div>
					{/if}
				</button>
			{/each}
		</div>
	{/each}
</div>

<style>
	.keyboard,
	.row {
		gap: 12px;
	}

	.keyboard {
		--second-row-offset: 8px;
		--third-row-offset: calc(var(--second-row-offset) * 1.5);

		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.row {
		display: flex;
		position: relative;
	}

	.row[data-index='1'] {
		left: calc(var(--second-row-offset) * -1);
	}

	.row[data-index='2'] {
		left: calc(var(--third-row-offset) * -1);
	}

	.key {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		/* align-items: center; */

		padding: 0;
		margin: 0;
	}

	.key .inner {
		display: flex;
		justify-content: center;
		align-items: center;

		flex: 1;
		padding: 1rem;
	}

	@media (max-width: 768px) {
		.key .inner {
			padding: 0.5rem;
		}

		.key .letter {
			font-size: 0.75rem;
		}
	}

	@media (max-width: 480px) {
		.key .inner {
			padding: 0.35rem;
		}

		.key .letter {
			font-size: 0.5rem;
		}
	}

	.health-bar {
		--gutter: 4px;
		position: relative;
		left: calc(var(--gutter) * -1);
		width: calc(var(--health-percentage) + var(--gutter));
		height: 4px;
		background-color: red;
	}

	.health-icons {
		display: flex;
	}
</style>
