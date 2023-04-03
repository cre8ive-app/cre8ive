<script>
	import { onMount } from 'svelte'
	import { goto } from '$app/navigation'

	onMount(() => {
		// TODO: is there a way to set index page in sveltekit?
		goto('/dashboard')
	})
</script>
