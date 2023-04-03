<script lang="ts">
	export let showModal: boolean = false
</script>

<div class="fixed inset-0 z-10 bg-gray-800 bg-opacity-75" class:hidden={!showModal}>
	<div class="flex h-screen items-center justify-center">
		<div class="rounded-sm bg-white dark:bg-neutral-800 p-6 shadow-lg">
			<slot />
		</div>
	</div>
</div>
