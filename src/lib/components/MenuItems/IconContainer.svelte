<script lang="ts">
	// @ts-ignore:next-line
	import tippy from 'sveltejs-tippy'

	export let tooltipContent: string
	export let tooltipPosition: 'top' | 'bottom' | 'left' | 'right' = 'bottom'
	export let isMenuActive: boolean = false
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
	class:bg-black={!isMenuActive}
	class:bg-neutral-700={isMenuActive}
	class="cursor-pointer p-5 hover:bg-neutral-800"
	use:tippy={{ content: tooltipContent, placement: tooltipPosition }}
	on:click
>
	<slot />
</div>
