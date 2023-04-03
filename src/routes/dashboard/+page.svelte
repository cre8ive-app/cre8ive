<script lang="ts">
	import { onMount } from 'svelte'
	import canvasStore from '$lib/stores/canvasStore'
	import generalStore from '$lib/stores/generalStore'
	import { goto } from '$app/navigation'
	import Modal from '$lib/components/Modal.svelte'
	import { pb } from '$lib/pocketbase'

	// @ts-ignore:next-line
	import tippy from 'sveltejs-tippy'

	let showModal: 'newCanvas' | 'renameCanvas' | null = null
	let canvasName = 'Untitled Canvas'
	let canvasIdToRename: string | null = null

	onMount(async () => {
		// TODO: handle auth check at route level
		if (!pb.authStore.isValid) {
			goto('/login')
			return false
		}

		const defaultSpace = await canvasStore.loadSpace()

		if (defaultSpace) {
			canvasStore.loadCanvas(defaultSpace.id)
		}
	})

	const cancel = () => {
		showModal = null
		canvasIdToRename = null
	}

	// TODO: show message on error
	const create = async (type: 'newCanvas' | 'renameCanvas') => {
		if (type === 'newCanvas') {
			const { spaceId, newCanvasId } = await canvasStore.createCanvas(canvasName)

			if (spaceId && newCanvasId) {
				goto(`/canvas?space-id=${spaceId}&canvas-id=${newCanvasId}`)
			}
		} else if (type === 'renameCanvas' && canvasIdToRename) {
			canvasStore.renameCanvas(canvasIdToRename, canvasName)
			canvasIdToRename = null
		}

		showModal = null
	}
</script>

<div class="flex bg-white font-sans text-black dark:bg-neutral-800 dark:text-white">
	<!-- TODO: on load, select default project -->
	<div class="h-screen overflow-auto border-r text-center dark:border-r-neutral-600">
		{#each [...$canvasStore.space] as space (space.id)}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div
				class="cursor-pointer border-b bg-white p-5 hover:bg-slate-200 dark:border-b-neutral-600 dark:bg-neutral-800 dark:hover:bg-neutral-900"
				on:click={() => {
					canvasStore.setActiveSpaceId(space.id)
					canvasStore.loadCanvas(space.id)
				}}
				use:tippy={{ content: `${space.name} space`, placement: 'right' }}
			>
				<div
					class="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-600 font-mono text-white"
				>
					{[...space.name].shift()?.toUpperCase()}
				</div>
			</div>
		{/each}

		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div
			class="cursor-pointer border-b bg-white p-5 hover:bg-slate-200 dark:border-b-neutral-600 dark:bg-neutral-800 dark:hover:bg-neutral-900"
			on:click={() => {
				goto('/login')
			}}
			use:tippy={{ content: 'login', placement: 'right' }}
		>
			<img
				class="mb-0 ml-auto mr-auto mt-0"
				src="/icons/login-box-line.svg"
				alt="icon"
				class:svg-white={$generalStore.generalSettings.darkMode}
				class:svg-black={!$generalStore.generalSettings.darkMode}
			/>
		</div>

		<!-- TODO: impletement create space feature -->
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- <div class="p-5 bg-white hover:bg-slate-200 cursor-pointer border-b"
            on:click={() => {}} 
            use:tippy={{ content: 'add new space', placement: 'right' }}
        >
            <img class="svg-black mr-auto ml-auto mt-0 mb-0" src="/icons/add-box-line.svg" alt="icon" />
        </div> -->
	</div>

	<Modal showModal={showModal !== null}>
		<h2 class="mb-6 text-lg font-medium">
			{#if showModal === 'newCanvas'}
				New Canvas Name
			{:else}
				Rename Canvas
			{/if}
		</h2>

		<div class="flex flex-wrap">
			<div class="flex flex-col">
				<input
					type="text"
					class="w-96 border p-2 text-black dark:border-neutral-600 dark:text-black"
					bind:value={canvasName}
				/>
			</div>
		</div>

		<div class="mt-5 text-right">
			<button
				class="bg-slate-400 px-4 py-2 text-white hover:bg-slate-500"
				on:click={() => {
					cancel()
				}}>Cancel</button
			>
			<button
				class="bg-black px-4 py-2 text-white hover:bg-neutral-700"
				on:click={() => {
					if (showModal) {
						create(showModal)
					}
				}}
			>
				{#if showModal === 'newCanvas'}
					Create
				{:else}
					Rename
				{/if}
			</button>
		</div>
	</Modal>

	<div>
		<div class="flex basis-full flex-wrap p-5 px-2">
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div
				class="mb-5 mr-5 h-52 w-52 cursor-pointer
				border
				bg-slate-100
				p-5
				hover:bg-slate-200
				dark:border-neutral-600
				dark:bg-neutral-900
				dark:hover:bg-neutral-800"
				on:click={() => {
					showModal = 'newCanvas'
					canvasName = 'Untitled Canvas'
				}}
			>
				<img
					class="w-12"
					src="/icons/sticky-note-line.svg"
					alt="icon"
					class:svg-white={$generalStore.generalSettings.darkMode}
					class:svg-black={!$generalStore.generalSettings.darkMode}
				/>
				<span class="pl-1">Create new canvas</span>
			</div>

			{#each [...$canvasStore.canvas.keys()] as canvasId (canvasId)}
				{@const canvas = $canvasStore.canvas.get(canvasId)}

				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<div
					class="relative mb-5 mr-5 h-52 w-52
				border
				bg-white
				dark:border-neutral-600
				dark:bg-neutral-800
				"
				>
					<div
						class="h-4/5 cursor-pointer p-5
						hover:bg-slate-200 dark:hover:bg-neutral-900"
						on:click={() => {
							goto(`/canvas?space-id=${canvas?.space_id}&canvas-id=${canvasId}`)
						}}
					>
						{canvas?.name}
					</div>

					<div class="bottom-0 top-0 h-1/5 border-t dark:border-t-neutral-600">
						<div
							class="absolute right-0 mr-10 w-10 cursor-pointer bg-white p-3 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-900"
							use:tippy={{ content: 'Rename Canvas', placement: 'bottom' }}
							on:click={() => {
								if (canvas) {
									canvasIdToRename = canvasId
									canvasName = canvas.name
									showModal = 'renameCanvas'
								}
							}}
						>
							<img
								width="40px"
								class:svg-white={$generalStore.generalSettings.darkMode}
								class:svg-black={!$generalStore.generalSettings.darkMode}
								src="/icons/input-cursor-move.svg"
								alt="rename canvas"
							/>
						</div>

						<div
							class="absolute right-0 w-10 cursor-pointer bg-white p-3 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-900"
							use:tippy={{ content: 'Delete Canvas', placement: 'bottom' }}
							on:click={async () => {
								if (
									confirm(`Canvas "${canvas?.name}" will be deleted`) &&
									canvas?.space_id
								) {
									await canvasStore.deleteCanvas(canvas?.space_id, canvasId)
								}
							}}
						>
							<img
								class:svg-white={$generalStore.generalSettings.darkMode}
								class:svg-black={!$generalStore.generalSettings.darkMode}
								src="/icons/delete-bin-2-line.svg"
								alt="delete canvas"
							/>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>
