<script lang="ts">
	import { goto } from '$app/navigation'
	import { pb } from '$lib/pocketbase'
	import generalStore from '$lib/stores/generalStore'

	// TODO: get this from ENV var
	let emailId = 'admin@example.com'
	let password = '&uMRhy5^FqytdQ9Z%uzU'

	const login = async () => {
		try {
			generalStore.toggleShowProgress(true)

			await pb.admins.authWithPassword(emailId, password)

			generalStore.toggleShowProgress(false)

			goto('/dashboard')
		} catch (e: any) {
			generalStore.toggleShowProgress(false)

			console.error('failed to login', e)
			console.info(e.data)
		}
	}
</script>

<div class="flex h-screen bg-white dark:bg-neutral-800 text-black dark:text-white font-sans">
		<div class="p-5 mx-auto my-0 mt-40">
			<h2 class="mb-6 text-lg font-medium">Login</h2>

			<div class="flex flex-col">
				<div class="mb-5">
					<label for="">
						Email 
						<input type="text" class="w-96 text-black border p-2 ml-10" bind:value={emailId} />
					</label>
				</div>

				<div class="mb-5">
					<label for="">
						Password 
						<input type="password" class="w-96 text-black border p-2 ml-3" bind:value={password} />
					</label>
				</div>
			</div>

			<div class="mt-5 text-right">
				<button
					class="bg-black px-4 py-2 text-white hover:bg-neutral-700"
					on:click={() => { login() }}
				>
					Login
				</button>
			</div>
		</div>
</div>
