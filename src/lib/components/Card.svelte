<script lang="ts">
	import { onMount } from 'svelte'
	import cardStore from '$lib/stores/cardStore'
	import canvasStore from '$lib/stores/canvasStore'
	import TextEditor from './TextEditor.svelte'
	import { page } from '$app/stores'

	onMount(() => {
		// TODO: Pull this from store?
		const spaceId = $page.url.searchParams.get('space-id')
		const canvasId = $page.url.searchParams.get('canvas-id')

		if (!spaceId || !canvasId) {
			return false
		}

		cardStore.loadCards(spaceId, canvasId)

		return () => {
			cardStore.clearCards()
		}
	})

	const dblClickedOnCard = (e: MouseEvent) => {
		if (e.target) {
			const ele = e.target as HTMLElement
			const cardId = ele.closest('.card')?.getAttribute('id') as string
			const cardType = ele.closest('.card')?.getAttribute('data-type') as string

			if (cardType === 'text' && cardId !== $cardStore.activeEditorId) {
				cardStore.setSelectedCards([])
				cardStore.setActiveEditorId(cardId)
				cardStore.addCardsToSave([cardId])
				canvasStore.setIsUnSaved('textUpdated')
			}
		}
	}

	const cardTransform = (card: any) => {
		return `
			background-color: ${card.style.backgroundColor};
			color: ${card.style.color};
			border: ${card.style.border ? card.style.border : '1px solid #000000'};
			padding: ${card.type === 'text' ? '30px' : '0px'};
			width: ${typeof card.width === 'number' ? card.width + 'px' : card.width};
			height: ${typeof card.height === 'number' ? card.height + 'px' : card.height};
			transform: translate(${card.left}px, ${card.top}px)
		`
	}
</script>

{#each [...$cardStore.cards.keys()] as cardId (cardId)}
	{@const card = $cardStore.cards.get(cardId)}

	<div
		class="card overflow-hidden"
		class:card-border-sketch={card?.settings?.borderStyle === 'sketch'}
		class:activeEditor={$cardStore.activeEditorId === card?.id}
		class:hover:cursor-text={$cardStore.activeEditorId === card?.id}
		id={cardId}
		data-type={card?.type}
		style={cardTransform(card)}
		on:dblclick={dblClickedOnCard}
	>
		{#if card?.type === 'text'}
			<TextEditor
				cardId={card?.id}
				isDisabled={$cardStore.activeEditorId === card?.id ? false : true}
				content={card?.content}
			/>
		{:else if card?.type === 'image'}
			<!-- TODO: make this dynamic -->
			<img
				src={`http://127.0.0.1:8090/api/files/cards/${card?.id}/${card?.media}`}
				alt={card?.media}
				width="100%"
				height="100%"
			/>
		{/if}
	</div>
{/each}

<style>
	.card {
		position: absolute;
		outline: 1px solid transparent;
	}
</style>
