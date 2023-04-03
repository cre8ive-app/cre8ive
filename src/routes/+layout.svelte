<script lang="ts">
	import '../app.css'
	import { goto } from '$app/navigation'
	import { browser } from '$app/environment'
	import canvasStore from '$lib/stores/canvasStore'
	import generalStore from '$lib/stores/generalStore'
	import { page } from '$app/stores'
	import DarkMode from '$lib/components/DarkMode.svelte'
	import { onMount } from 'svelte'
	import { isFullScreen } from '$lib/utils'

	let fullScreen: boolean = false // TODO: set and get this from store?

	onMount(() => {
		// TODO: get these values from ENV vars
		console.log(`CRE8IVE v0.0.1, POCKETBASE v0.14.1`)

		generalStore.loadGeneralSettings()
	})

	const fullScreenChanged = (e: Event) => {
		fullScreen = isFullScreen() ? true : false
	}
</script>

<svelte:window on:fullscreenchange={fullScreenChanged} />

<div class="bg-white text-black dark:bg-neutral-800 dark:text-white">
	<div class="p-4 font-mono" class:hidden={fullScreen}>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div
			class="inline cursor-pointer text-3xl font-bold"
			on:click={() => {
				goto('/dashboard')
			}}
			title="Back to space"
		>
			CRE8IVE
			<!-- <div class="flex">
				<span>CRE</span>
				<span class="text-6xl">∞</span>
				<span>IVE</span>
			</div> -->
		</div>

		{#if browser && $page.url.searchParams.get('canvas-id')}
			<div class="text-lg">
				{$canvasStore.canvasSettings.name}

				{#if $canvasStore.isUnSaved}
					<span>- <span class="text-red-600">unsaved</span></span>
				{/if}
			</div>
		{/if}

		<div class="absolute right-10 top-10">
			<DarkMode isDarkMode={$generalStore.generalSettings.darkMode} />
		</div>
	</div>

	<div
		class="absolute h-1 w-full overflow-hidden bg-white dark:bg-black"
		class:hidden={!$generalStore.showProgress}
	>
		<div class="loading-bar absolute -left-1/2 h-full w-1/2 bg-black dark:bg-white" />
	</div>

	<slot />
</div>

<style>
	/* div {
		font-family: 'Source Sans Pro';
	} */

	.loading-bar {
		animation: loading 1s ease-in 0.5s infinite;
	}

	@keyframes loading {
		0% {
			transform: translateX(0);
		}
		to {
			transform: translateX(400%);
		}
	}

	:global(.noPointerEvents) {
		pointer-events: none !important;
	}

	:global(.tox-notifications-container) {
		display: none !important;
	}

	:global(.tinymce-wrapper) {
		/* background-color: antiquewhite; */
		width: 100%;
		height: 100%;
	}

	:global(.mce-content-body) {
		/* background-color: aquamarine; */
		width: 100%;
		height: 100%;
	}

	:global([contenteditable]) {
		outline: 0px solid transparent;
	}

	:global(img.svg-black) {
		filter: invert(0%) sepia(6%) saturate(26%) hue-rotate(224deg) brightness(97%) contrast(107%);
	}

	:global(img.svg-white) {
		filter: invert(100%) sepia(100%) saturate(0%) hue-rotate(27deg) brightness(103%)
			contrast(102%);
	}

	/* TODO: Since I have replaced the color picker with iro i think this can be removed */

	/* fix svelte-color-picker ui */
	:global(.hex-text-block) {
		width: 70px !important;
		height: auto !important;
	}

	/* fix svelte-color-picker ui */
	:global(.rgb-text-block) {
		width: 30px !important;
		height: 40px !important;
	}

	/* fix svelte-color-picker ui */
	:global(.rgb-text-block > .text-label) {
		top: -5px !important;
	}

	:global(.card-border-sketch) {
		border-top-left-radius: 255px 15px;
		border-top-right-radius: 15px 225px;
		border-bottom-right-radius: 225px 15px;
		border-bottom-left-radius: 15px 255px;
	}
</style>
