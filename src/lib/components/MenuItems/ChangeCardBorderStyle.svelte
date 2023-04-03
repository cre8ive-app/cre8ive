<script lang="ts">
	import IconContainer from './IconContainer.svelte'
	import cardStore from '$lib/stores/cardStore'
	import canvasStore from '$lib/stores/canvasStore'
	import generalStore from '$lib/stores/generalStore'
	import Modal from '../Modal.svelte'
	import { writable, type Writable } from 'svelte/store'
	import { MenuItem } from '$lib/stores/generalStore'
	import type { Card, CardStyle } from '$lib/stores/cardStore'
	import iro from '@jaames/iro'
	import { onMount, onDestroy } from 'svelte'

	let noBorder: boolean = false
	let colorPicker: any = null
	let sketchStyle: boolean = false

	let border: Writable<{ thickness: string, style: string, color: string }> = writable({
		thickness: '1px',
		style: 'solid',
		color: '#FFFFFF'
	})

	const styles = [
		{ name: 'Solid', value: 'solid' },
		{ name: 'Dashed', value: 'dashed' },
		{ name: 'Dotted', value: 'dotted' }
	]

	const thickness = [
		{ name: '1', value: '1px' },
		{ name: '2', value: '2px' },
		{ name: '5', value: '5px' },
		{ name: '10', value: '10px' },
		{ name: '15', value: '15px' }
	]

	const setBorderData = (key: string, value: string | boolean) => {
		if (key === 'sketch' && typeof value === 'boolean') {
			sketchStyle = value
			return false
		}

		if (key === 'noBorder' && typeof value === 'boolean') {
			noBorder = value
			return false
		}

		if (key === 'color' && colorPicker) {
			colorPicker.color.set(value)
		}

		border.set({ ...$border, [key]: value })
	}

	const resetBorderData = () => {
		sketchStyle = false
		noBorder = false
		border.set({ thickness: '1px', style: 'solid', color: '#FFFFFF' })

		if (colorPicker) {
			colorPicker.color.set('#FFFFFF')
		}
	}

	$: isChangeCardBorderActive = $generalStore.isMenuActive.changeCardBorder

	// pre-populate border style from selected cards if the style is same
	$: if (isChangeCardBorderActive && $generalStore.preSelectedCards.length > 0) {
		const borderThickness = new Set()
		const borderStyle = new Set()
		const borderColor = new Set()
		const sketch = new Set()
		const isNoBorder = new Set()

		for (const cardEle of $generalStore.preSelectedCards) {
			const cardId = cardEle.getAttribute('id')

			if (!cardId) continue

			const card = $cardStore.cards.get(cardId)
			const cardBorder = card?.style.border

			if (cardBorder === 'none') {
				isNoBorder.add(true)
				continue
			}

			if (cardBorder && cardBorder !== 'none') {
				const border = cardBorder.split(' ')

				if (border.length !== 3) continue

				// const thickness = border[0].replace(/\px$/, "")
				const thickness = border[0]
				const style = border[1]
				const color = border[2].replace(/\;$/, "")

				borderThickness.add(thickness)
				borderStyle.add(style)
				borderColor.add(color)
			}
			
			sketch.add(card?.settings?.borderStyle === 'sketch')
		}

		if (borderThickness.size === 1) {
			setBorderData('thickness', [...borderThickness.values()][0] as string)
		}

		if (borderStyle.size === 1) {
			setBorderData('style', [...borderStyle.values()][0] as string)
		}

		if (borderColor.size === 1 && colorPicker) {
			setBorderData('color', [...borderColor.values()][0] as string)
		}

		if (sketch.size === 1 && sketch.has(true)) {
			setBorderData('sketch', true)
		}

		if (isNoBorder.size === 1 && isNoBorder.has(true)) {
			setBorderData('noBorder', true)
		}
	} else {
		resetBorderData()
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
						border: noBorder
							? 'none'
							: `${$border.thickness} ${$border.style} ${$border.color};`
					} as CardStyle
				}

				if (sketchStyle) {
					updateStyle.settings = { borderStyle: 'sketch' }
				} else {
					updateStyle.settings = { borderStyle: '' }
				}

				cardStore.updateCard(cardId, updateStyle)

				cardIds.push(cardId)
			}

			cardStore.addCardsToSave(cardIds)
			canvasStore.setIsUnSaved('cardBorderChanged')
		}
	}

	const close = () => {
		generalStore.toggleIsMenuActive(MenuItem.select, true)
		generalStore.cardSelection('reselect')
	}

	const onHexaInput = () => {
		if (colorPicker) {
			colorPicker.color.set($border.color)
		}
	}

	onMount(() => {
		// @ts-ignore:next-line
		colorPicker = new iro.ColorPicker("#border-color-container", {
			layout: [
				{ 
					component: iro.ui.Box,
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
				},
			]
		})

		colorPicker.on('color:change', function(color: any) {
			border.set({ ...$border, color: color.hex8String })
		})
	})
</script>

<div>
	<IconContainer
		on:click
		tooltipContent="Change card border style"
		tooltipPosition="right"
		isMenuActive={$generalStore.isMenuActive.changeCardBorder}
		on:click={() => {
			generalStore.cardSelection('preserve')
			generalStore.toggleIsMenuActive(
				MenuItem.changeCardBorder,
				!$generalStore.isMenuActive.changeCardBorder
			)
		}}
	>
		<img class="svg-white" src="/icons/checkbox-blank-line.svg" alt="icon" />
	</IconContainer>

	<Modal showModal={$generalStore.isMenuActive.changeCardBorder}>
		<h2 class="mb-6 text-lg font-medium">Change card border style</h2>

		<div class="flex flex-wrap">
			<div id="border-color-container"></div>

			<div class="flex flex-col">
				<div
					class="ml-5 mb-5 h-20 w-20 border"
					class:card-border-sketch={sketchStyle}
					style={`border: ${
						noBorder
							? 'none'
							: `${$border.thickness} ${$border.style} ${$border.color}`
					};`}
				/>

				<div class="ml-5 mb-5 w-20">
					<input type="text" class="border bg-white text-black w-full" bind:value={$border.color} on:change={onHexaInput} />
				</div>

				<div class="ml-5 mb-5">
					<label for="">
						Style
						<select class="border text-black" bind:value={$border.style}>
							{#each styles as style}
								<option value={style.value}>{style.name}</option>
							{/each}
						</select>
					</label>
				</div>

				<div class="ml-5 mb-5">
					<label for="">
						Thickness
						<select class="border text-black" bind:value={$border.thickness}>
							{#each thickness as item}
								<option value={item.value}>{item.name}</option>
							{/each}
						</select>
					</label>
				</div>

				<div class="ml-5 mb-5">
					<label for="changeBorder-sketch">
						Sketch
						<input id="changeBorder-sketch" type="checkbox" bind:checked={sketchStyle} />
					</label>
				</div>

				<!-- TODO: checkbox style -->
				<div class="ml-5">
					<label for="changeBorder-NoBorder">
						No border
						<input id="changeBorder-NoBorder" type="checkbox" bind:checked={noBorder} />
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
