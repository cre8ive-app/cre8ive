<script lang="ts">
	import { onMount } from 'svelte'
	import Moveable from 'svelte-moveable'
	import generalStore from '$lib/stores/generalStore'
	import cardStore from '$lib/stores/cardStore'
	import canvasStore from '$lib/stores/canvasStore'
	import { roundup } from '$lib/utils'

	let moveable: any
	const cardsToUpdate: Map<string, { left: number; top: number; width: string; height: string }> =
		new Map()

	const getStyle = (
		e: any,
		eventType: 'drag' | 'resize'
	): { left: number; top: number; width: string; height: string } => {
		const target = e.target
		const cardType = target.getAttribute('data-type') as string

		let [left, top]: [left: number, top: number] =
			eventType === 'resize' ? e.drag.beforeTranslate : e.beforeTranslate

		left = roundup(left)
		top = roundup(top)

		let width: string, height: string

		if (cardType === 'image') {
			const imgEle = target.querySelector('img') as HTMLElement
			width = `${roundup(e.width)}px`
			height = roundup(imgEle.offsetHeight) + 'px'
		} else {
			width = `${roundup(e.width)}px`
			height = `${roundup(e.height)}px`
		}

		return { left, top, width, height }
	}

	const transformCard = (
		e: CustomEvent,
		eventType: 'drag' | 'resize',
		isGrouped: boolean = false
	): void => {
		if (!isGrouped) {
			const target = e.detail.target
			const cardId = target.getAttribute('id') as string

			const { left, top, width, height } = getStyle(e.detail, eventType)

			target.style.width = width
			target.style.height = height
			target.style.transform = `translate(${left}px, ${top}px)`

			cardsToUpdate.set(cardId, { left, top, width, height })
		} else if (isGrouped) {
			e.detail.events.map((ev: any) => {
				const target = ev.target
				const cardId = target.getAttribute('id') as string

				const { left, top, width, height } = getStyle(ev, eventType)

				target.style.width = width
				target.style.height = height
				target.style.transform = `translate(${left}px, ${top}px)`

				cardsToUpdate.set(cardId, { left, top, width, height })
			})
		}
	}

	const endEvent = (e: CustomEvent, setBy: 'cardDragged'| 'cardGroupDragged' | 'cardResized' | 'cardGroupResized') => {
		for (const cardId of cardsToUpdate.keys()) {
			cardStore.updateCard(cardId, { ...cardsToUpdate.get(cardId) })
		}

		cardStore.addCardsToSave([...cardsToUpdate.keys()])

		canvasStore.setIsUnSaved(setBy)

		cardsToUpdate.clear()
	}

	const onClickGroup = (e: CustomEvent) => {
		const d = e.detail

		if (d.isDouble) {
			cardStore.setSelectedCards([])

			let target = d.inputTarget

			if (!target.classList.contains('card')) {
				target = d.inputTarget.closest('.card') as HTMLElement
			}

			const cardId = target.getAttribute('id') as string
			const cardType = target.getAttribute('data-type') as string

			if ($cardStore.activeEditorId !== cardId && cardType === 'text') {
				cardStore.setActiveEditorId(cardId)
			}
		}
	}

	onMount(() => {
		// TODO: is there a better way to set and access it outside of comp?
		generalStore.setMoveable(moveable)
	})
</script>

<Moveable
	bind:this={moveable}
	target={$cardStore.selectedCards}
	origin={false}
	edge={false}
	draggable={$cardStore.activeEditorId ? false : true}
	resizable={$cardStore.activeEditorId ? false : true}
	on:drag={(e) => {
		transformCard(e, 'drag')
	}}
	on:dragGroup={(e) => {
		transformCard(e, 'drag', true)
	}}
	on:resize={(e) => {
		transformCard(e, 'resize')
	}}
	on:resizeGroup={(e) => {
		transformCard(e, 'resize', true)
	}}
	on:clickGroup={onClickGroup}
	on:dragEnd={(e) => endEvent(e, 'cardDragged')}
	on:dragGroupEnd={(e) => endEvent(e, 'cardGroupDragged')}
	on:resizeEnd={(e) => endEvent(e, 'cardResized')}
	on:resizeGroupEnd={(e) => endEvent(e, 'cardGroupResized')}
/>
