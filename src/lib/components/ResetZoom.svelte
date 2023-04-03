<script lang="ts">
	import generalStore from '$lib/stores/generalStore'

	const reset = () => {
		if ($generalStore.panzoom) {
			// $generalStore.panzoom.reset()
			$generalStore.panzoom.pan(0, 0)

			setTimeout(() => {
				$generalStore.panzoom.zoom(1, { animate: true })
			})
		}
	}
</script>

<div class="absolute bottom-10 right-28 z-50 bg-black">
	<div class="inline-flex rounded-md" role="group">
		<button
			type="button"
			class="bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
			on:click={() => {
				reset()
			}}
		>
			Reset Zoom
		</button>
	</div>
</div>
