<script lang="ts">
	export let style: 'success' | 'danger' = 'success'
	export let content: string
</script>

/** * TODO: set fixed width, close icon, auto disappear */
<div
	class="absolute left-1/2 right-0 w-max rounded-md border-2 px-10 py-4 text-white drop-shadow-lg"
	class:bg-green-500={style === 'success'}
	class:bg-red-500={style === 'danger'}
>
	<div class="flex flex-wrap text-lg">
		<span
			class="mr-4 flex h-8 w-8 items-center justify-center rounded-full bg-white font-mono font-extrabold text-black"
		>
			{#if style === 'success'} ✓ {:else} ✖ {/if}
		</span>
		<span>{content}</span>
	</div>
</div>
