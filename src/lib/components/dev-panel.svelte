<script lang="ts">
	import { gameContext } from '$lib/contexts.svelte';

	const gameState = gameContext.getEssential();

	let panelIsOpen = $state(false);
</script>

<div class="root">
	<button
		class="nes-btn"
		aria-label="toggle dev panel"
		onclick={() => {
			panelIsOpen = !panelIsOpen;
		}}><i class="nes-icon coin"></i></button
	>

	<div class={['nes-container with-title', 'panel', !panelIsOpen && 'closed']}>
		<p class="title">Dev Panel</p>
		<label>
			<input type="checkbox" class="nes-checkbox" bind:checked={gameState.dev_enableTimeLimit} />
			<span>Time Limit</span>
		</label>
		<label>
			<input type="checkbox" class="nes-checkbox" bind:checked={gameState.dev_enableLetterDamage} />
			<span>Letter Damage</span>
		</label>
	</div>
</div>

<style>
	.root {
		--gutter: 32px;

		position: fixed;
		top: var(--gutter);
		left: var(--gutter);

		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 16px;
	}

	.panel {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.panel.closed {
		display: none;
	}

	input[type='checkbox'] {
		margin-left: 0;
	}

	label span {
		user-select: none;
	}
</style>
