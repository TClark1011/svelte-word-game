<script lang="ts">
	let { children } = $props();

	$effect(() => {
		document.body.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
	});
</script>

{@render children()}
