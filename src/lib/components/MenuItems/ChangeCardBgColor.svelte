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

	let noColor = false
	let colorPicker: any = null
	let colorStore: Writable<string> = writable('#FFFFFF')
	let color: string = '#FFFFFF'

	const unsub = colorStore.subscribe((val) => (color = val))

	const setColor = (colorValue: string) => {
		colorStore.set(colorValue)

		if (colorPicker) {
			colorPicker.color.set(colorValue)
		}
	}

	$: isChangeColorActive = $generalStore.isMenuActive.changeCardBgColor

	// pre-populate color of a picker from selected cards if the color is same
	$: if (isChangeColorActive && $generalStore.preSelectedCards.length > 0) {
		const bgColor = new Set()

		for (const cardEle of $generalStore.preSelectedCards) {
			const cardId = cardEle.getAttribute('id')

			if (!cardId) continue

			const card = $cardStore.cards.get(cardId)
			bgColor.add(card?.style.backgroundColor)
		}

		if (bgColor.size === 1) {
			setColor([...bgColor.values()][0] as string)
		}
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
					style: { backgroundColor: noColor ? 'none' : color }
				})

				cardIds.push(cardId)
			}

			cardStore.addCardsToSave(cardIds)
			canvasStore.setIsUnSaved('cardBGColorChanged')
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
		colorPicker = new iro.ColorPicker('#bg-color-container', {
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
		tooltipContent="Change card background color"
		tooltipPosition="right"
		isMenuActive={$generalStore.isMenuActive.changeCardBgColor}
		on:click={() => {
			generalStore.cardSelection('preserve')
			generalStore.toggleIsMenuActive(
				MenuItem.changeCardBgColor,
				!$generalStore.isMenuActive.changeCardBgColor
			)
		}}
	>
		<img class="svg-white" src="/icons/paint-line.svg" alt="icon" />
	</IconContainer>

	<Modal showModal={$generalStore.isMenuActive.changeCardBgColor}>
		<h2 class="mb-6 text-lg font-medium">Change card background color</h2>

		<div class="flex flex-wrap">
			<div id="bg-color-container" />

			<div class="flex flex-col">
				<div
					class="mb-5 ml-5 h-20 w-20"
					style={`background-color: ${noColor ? 'none' : color};`}
				/>

				<div class="mb-5 ml-5 w-20">
					<input
						type="text"
						class="w-full border bg-white text-black"
						bind:value={color}
						on:change={onHexaInput}
					/>
				</div>

				<!-- TODO: checkbox style -->
				<div class="ml-5">
					<label for="changeColor-NoColor">
						No color
						<input id="changeColor-NoColor" type="checkbox" bind:checked={noColor} />
					</label>
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
