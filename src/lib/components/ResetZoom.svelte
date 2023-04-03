<script lang="ts">
    import generalStore from "$lib/stores/generalStore";

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

<div class="absolute bg-black right-28 bottom-10 z-50">
    <div class="inline-flex rounded-md" role="group">
        <button type="button" class="px-4 py-2 text-sm font-medium text-white bg-black hover:bg-neutral-700" on:click={() => { reset() }}>
          Reset Zoom
        </button>
    </div>
</div>
