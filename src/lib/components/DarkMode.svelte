<script lang="ts">
	import generalStore from '$lib/stores/generalStore'
	import canvasStore from '$lib/stores/canvasStore'
	import { browser } from '$app/environment'

	export let isDarkMode: boolean = false

	$: if (browser && (isDarkMode || !isDarkMode)) {
		const darkModeStatus = !!isDarkMode

		generalStore.toggleDarkMode(darkModeStatus)

		const htmlEle = document.getElementsByTagName('html')[0]

		if (darkModeStatus) {
			htmlEle.classList.add('dark')
		} else {
			htmlEle.classList.remove('dark')
		}

		canvasStore.setIsUnSaved('darkModeChanged')
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="cursor-pointer" on:click>
	<label class="relative inline-flex cursor-pointer items-center">
		<!-- <input type="checkbox" value="" class="sr-only peer" checked> -->
		<input type="checkbox" value="" class="peer sr-only" bind:checked={isDarkMode} />
		<div
			class="peer h-6
        w-11
        rounded-full bg-gray-200
        after:absolute
        after:left-[2px]
        after:top-0.5
        after:h-5
        after:w-5
        after:rounded-full
        after:border
        after:border-gray-300
        after:bg-white
        after:transition-all
        after:content-['']
        peer-checked:bg-black peer-checked:after:translate-x-full peer-checked:after:border-white
        dark:border-gray-200
        dark:bg-gray-500"
		/>
		<span class="ml-3 text-sm font-medium">Dark Mode</span>
	</label>
</div>
