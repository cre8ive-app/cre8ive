<script lang="ts">
	// @ts-ignore:next-line
	import tippy from 'sveltejs-tippy'
	import screenfull from 'screenfull'
	import { onMount, onDestroy } from 'svelte'

	let fullScreen = false

	const toggleFullScreenMode = () => {
		if (screenfull.isEnabled) {
			screenfull.toggle()
		}
	}

	onMount(() => {
		screenfull.on('change', () => {
			fullScreen = screenfull.isFullscreen
		})
	})

	onDestroy(() => {
		screenfull.off('change', () => {})
	})
</script>

<div class="absolute bottom-10 right-10 z-50">
	<button
		type="button"
		class="bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
		on:click={() => {
			toggleFullScreenMode()
		}}
		use:tippy={{ content: 'Fullscreen', placement: 'top' }}
	>
		{#if fullScreen}
			<img class="svg-white" src="/icons/fullscreen-exit-line.svg" alt="icon" />
		{:else}
			<img class="svg-white" src="/icons/fullscreen-line.svg" alt="icon" />
		{/if}
	</button>
</div>
