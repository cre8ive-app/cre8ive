<script lang="ts">
	import Selecto from 'svelte-selecto'
	import generalStore from '$lib/stores/generalStore'
	import canvasStore from '$lib/stores/canvasStore'
	import cardStore from '$lib/stores/cardStore'

	$: moveable = $generalStore.moveable

	const selectoOnDragStart = ({ detail: e }: { detail: any }) => {
		if ($cardStore.activeEditorId || $generalStore.isMenuActive.addNewCard) {
			e.stop()
		}

		const target = e.inputEvent.target

		if (
			moveable.isMoveableElement(target) ||
			$cardStore.selectedCards.some((t: any) => t === target || t.contains(target))
		) {
			e.stop()
		}
	}

	const selectoOnSelect = ({ detail: e }: { detail: any }) => {
		cardStore.setSelectedCards(e.selected)
	}

	const selectoOnSelectEnd = ({ detail: e }: { detail: any }) => {
		const selectedCardsList = e.selected
		const cardsInGroup: HTMLElement[] = []

		if (selectedCardsList && selectedCardsList.length > 0) {
			selectedCardsList.forEach((cardEle: HTMLElement) => {
				const cardId = cardEle.getAttribute('id') as string
				const cardGroup = canvasStore.getCardGroup(cardId)

				if (cardGroup) {
					const cardEles = cardGroup.groupCardIds.map(
						(cardId) => document.getElementById(cardId) as HTMLElement
					)
					cardsInGroup.push(...cardEles)
				}
			})
		}

		const cardsToSelect: HTMLElement[] = [...new Set([...selectedCardsList, ...cardsInGroup])]

		if (cardsToSelect.length > 0) {
			cardStore.setSelectedCards(cardsToSelect)
		}

		if (e.isDragStart) {
			e.inputEvent.preventDefault()

			// TODO: do i need this setTimeout?
			setTimeout(() => {
				moveable.dragStart(e.inputEvent)
			})
		}
	}
</script>

<Selecto
	container={document.getElementById('canvas-wrapper')}
	dragContainer={document.getElementById('canvas-wrapper')}
	selectableTargets={['.card']}
	selectByClick={$cardStore.activeEditorId || $generalStore.isMenuActive.addNewCard
		? false
		: true}
	preventClickEventOnDragStart={true}
	selectFromInside={false}
	continueSelect={false}
	toggleContinueSelect={'shift'}
	keyContainer={document.getElementById('canvas-wrapper')}
	ratio={0}
	hitRate={0}
	on:dragStart={selectoOnDragStart}
	on:select={selectoOnSelect}
	on:selectEnd={selectoOnSelectEnd}
/>
