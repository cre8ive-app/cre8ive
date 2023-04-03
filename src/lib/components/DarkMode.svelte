<script lang="ts">
    import generalStore from "$lib/stores/generalStore"
    import canvasStore from "$lib/stores/canvasStore"
    import { browser } from "$app/environment"

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
<div
    class="cursor-pointer"
    on:click
>
    <label class="relative inline-flex items-center cursor-pointer">
        <!-- <input type="checkbox" value="" class="sr-only peer" checked> -->
        <input type="checkbox" value="" class="sr-only peer"
            bind:checked={isDarkMode}
        >
        <div class="w-11 h-6 
        bg-gray-200 
        rounded-full peer 
        dark:bg-gray-500 
        peer-checked:after:translate-x-full 
        peer-checked:after:border-white 
        after:content-[''] 
        after:absolute 
        after:top-0.5 
        after:left-[2px] 
        after:bg-white 
        after:border-gray-300 
        after:border 
        after:rounded-full 
        after:h-5 after:w-5 after:transition-all 
        dark:border-gray-200 
        peer-checked:bg-black"></div>
        <span class="ml-3 text-sm font-medium">Dark Mode</span>
    </label>
</div>
