<script lang="ts">
	import IconContainer from './IconContainer.svelte'
	import cardStore from '$lib/stores/cardStore'
	import canvasStore from '$lib/stores/canvasStore'
	import generalStore from '$lib/stores/generalStore'
	import Modal from '../Modal.svelte'
	import { writable, type Writable } from 'svelte/store'
	import { MenuItem } from '$lib/stores/generalStore'
	import { onMount, onDestroy } from 'svelte'
	import iro from '@jaames/iro'

	let colorPicker: any = null
	let colorStore: Writable<string> = writable('#000000')
	let color: string = '#000000'

	const unsub = colorStore.subscribe((val) => (color = val))

	const setColor = (colorValue: string) => {
		colorStore.set(colorValue)

		if (colorPicker) {
			colorPicker.color.set(colorValue)
		}
	}

	$: isChangeColorActive = $generalStore.isMenuActive.changeFontColor

	// pre-populate color of a picker from selected cards if the color is same
	$: if (isChangeColorActive && $generalStore.preSelectedCards.length > 0) {
		const fontColor = new Set()

		for (const cardEle of $generalStore.preSelectedCards) {
			const cardId = cardEle.getAttribute('id')

			if (!cardId) continue

			const card = $cardStore.cards.get(cardId)
			fontColor.add(card?.style.color)
		}

		if (fontColor.size === 1) {
			setColor([...fontColor.values()][0] as string)
		}
	} else {
		setColor('#000000')
	}

	const save = () => {
		generalStore.toggleIsMenuActive(MenuItem.select, true)

		if ($generalStore.preSelectedCards.length > 0) {
			generalStore.cardSelection('reselect')

			const cardIds = []

			for (const cardEle of $cardStore.selectedCards) {
				const cardId = cardEle.getAttribute('id')

				if (!cardId) continue

				cardStore.updateCard(cardId, {
					style: { color }
				})

				cardIds.push(cardId)
			}

			cardStore.addCardsToSave(cardIds)
			canvasStore.setIsUnSaved('cardFontColorChanged')
		}
	}

	const close = () => {
		generalStore.toggleIsMenuActive(MenuItem.select, true)
		generalStore.cardSelection('reselect')
	}

	const onHexaInput = () => {
		if (colorPicker) {
			colorPicker.color.set(color)
			// colorPicker.forceUpdate()
		}
	}

	onMount(() => {
		// @ts-ignore:next-line
		colorPicker = new iro.ColorPicker('#font-color-container', {
			layout: [
				{
					component: iro.ui.Box
				},
				{
					component: iro.ui.Slider,
					options: {
						sliderType: 'hue'
					}
				},
				{
					component: iro.ui.Slider,
					options: {
						sliderType: 'alpha'
					}
				}
			]
		})

		colorPicker.on('color:change', function (color: any) {
			colorStore.set(color.hex8String)
		})
	})

	onDestroy(unsub)
</script>

<div>
	<IconContainer
		on:click
		tooltipContent="Change font color"
		tooltipPosition="right"
		isMenuActive={$generalStore.isMenuActive.changeFontColor}
		on:click={() => {
			generalStore.cardSelection('preserve')
			generalStore.toggleIsMenuActive(
				MenuItem.changeFontColor,
				!$generalStore.isMenuActive.changeFontColor
			)
		}}
	>
		<img class="svg-white" src="/icons/font-color.svg" alt="icon" />
	</IconContainer>

	<Modal showModal={$generalStore.isMenuActive.changeFontColor}>
		<h2 class="mb-6 text-lg font-medium">Change font color</h2>

		<div class="flex flex-wrap">
			<div id="font-color-container" />

			<div class="flex flex-col">
				<div class="mb-5 text-center text-8xl" style={`color: ${color};`}>A</div>

				<div class="mb-5 ml-5 w-20">
					<input
						type="text"
						class="w-full border bg-white text-black"
						bind:value={color}
						on:change={onHexaInput}
					/>
				</div>
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
