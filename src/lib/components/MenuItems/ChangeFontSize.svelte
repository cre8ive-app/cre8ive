<script lang="ts">
	import IconContainer from './IconContainer.svelte'
	import cardStore from '$lib/stores/cardStore'
	import canvasStore from '$lib/stores/canvasStore'
	import generalStore from '$lib/stores/generalStore'
	import Modal from '../Modal.svelte'
	import { writable, type Writable } from 'svelte/store'
	import { MenuItem } from '$lib/stores/generalStore'
	import type { Card, CardStyle } from '$lib/stores/cardStore'

	const defaultFontSize = { value: 4, unit: 'em' }
	let fontSize: Writable<{ value: number; unit: string }> = writable(defaultFontSize)

	$: isChangeSizeActive = $generalStore.isMenuActive.changeFontSize

	// pre-populate font size from selected cards if the value is same
	$: if (isChangeSizeActive && $generalStore.preSelectedCards.length > 0) {
		const fontSizeList = new Set()

		for (const cardEle of $generalStore.preSelectedCards) {
			const cardId = cardEle.getAttribute('id')

			if (!cardId) continue

			const card = $cardStore.cards.get(cardId)
			const cardFontSize = card?.style.fontSize

			if (cardFontSize) {
				fontSizeList.add(cardFontSize.value)
			}
		}

		let size = defaultFontSize
		if (fontSizeList.size === 1) {
			size = { value: [...fontSizeList.values()][0] as number, unit: defaultFontSize.unit }
		}

		fontSize.set({ ...size })
	} else {
		fontSize.set(defaultFontSize)
	}

	const save = () => {
		generalStore.toggleIsMenuActive(MenuItem.select, true)

		if ($generalStore.preSelectedCards.length > 0) {
			generalStore.cardSelection('reselect')

			const cardIds = []

			for (const cardEle of $cardStore.selectedCards) {
				const cardId = cardEle.getAttribute('id')

				if (!cardId) continue

				const updateStyle: Partial<Card> = {
					style: {
						fontSize: { ...$fontSize }
					} as CardStyle
				}

				cardStore.updateCard(cardId, updateStyle)
				cardIds.push(cardId)
			}

			cardStore.addCardsToSave(cardIds)
			canvasStore.setIsUnSaved('cardFontSizeChanged')
		}
	}

	const close = () => {
		generalStore.toggleIsMenuActive(MenuItem.select, true)
		generalStore.cardSelection('reselect')
	}
</script>

<div>
	<IconContainer
		on:click
		tooltipContent="Change font size"
		tooltipPosition="right"
		isMenuActive={$generalStore.isMenuActive.changeFontSize}
		on:click={() => {
			generalStore.cardSelection('preserve')
			generalStore.toggleIsMenuActive(
				MenuItem.changeFontSize,
				!$generalStore.isMenuActive.changeFontSize
			)
		}}
	>
		<img class="svg-white" src="/icons/font-size.svg" alt="icon" />
	</IconContainer>

	<Modal showModal={$generalStore.isMenuActive.changeFontSize}>
		<h2 class="mb-6 text-lg font-medium">Change font size</h2>

		<div class="flex flex-wrap">
			<div class="h-52 w-96 overflow-auto border-0 text-center">
				<span style={`font-size: ${$fontSize.value}${$fontSize.unit};`}>A</span>
			</div>

			<div class="mb-5 ml-5">
				<input
					type="text"
					class="w-20 border bg-white p-3 text-black"
					bind:value={$fontSize.value}
				/>
				{defaultFontSize.unit}
			</div>
		</div>

		<div class="mt-5 text-right">
			<button
				class="bg-slate-400 px-4 py-2 text-white hover:bg-slate-500"
				on:click={() => {
					close()
				}}>Close</button
			>
			<button
				class="bg-black px-4 py-2 text-white hover:bg-neutral-700"
				on:click={() => {
					save()
				}}>Save</button
			>
		</div>
	</Modal>
</div>
