<script lang="ts">
    import { convertScaleToZoomPer } from "$lib/utils"
    import canvasStore from '$lib/stores/canvasStore'
    import generalStore from "$lib/stores/generalStore";

    const setScale = () => {
        const panzoomInstance = $generalStore.panzoom
        panzoomInstance.zoom(1, { animate: true })
    }
</script>

<div class="absolute bg-black right-60 bottom-10 z-50">
    <div class="inline-flex rounded-md" role="group">
        <div class="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
        {convertScaleToZoomPer($canvasStore.canvasSettings.scale)}%
        </div>
        <button type="button" class="px-4 py-2 text-sm font-medium text-white bg-black hover:bg-neutral-700" on:click={() => { setScale() }}>
          Zoom to 100%
        </button>
    </div>
</div>
