<script lang="ts">
	import { convertScaleToZoomPer } from '$lib/utils'
	import canvasStore from '$lib/stores/canvasStore'
	import generalStore from '$lib/stores/generalStore'

	const setScale = () => {
		const panzoomInstance = $generalStore.panzoom
		panzoomInstance.zoom(1, { animate: true })
	}
</script>

<div class="absolute bottom-10 right-60 z-50 bg-black">
	<div class="inline-flex rounded-md" role="group">
		<div
			class="border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
		>
			{convertScaleToZoomPer($canvasStore.canvasSettings.scale)}%
		</div>
		<button
			type="button"
			class="bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
			on:click={() => {
				setScale()
			}}
		>
			Zoom to 100%
		</button>
	</div>
</div>
