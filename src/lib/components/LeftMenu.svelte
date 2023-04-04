<script lang="ts">
	import IconContainer from './MenuItems/IconContainer.svelte'
	import generalStore from '$lib/stores/generalStore'
	import { MenuItem } from '$lib/stores/generalStore'
	import ChangeCardBgColor from './MenuItems/ChangeCardBgColor.svelte'
	import ChangeCardBorderStyle from './MenuItems/ChangeCardBorderStyle.svelte'
	import ChangeFontColor from './MenuItems/ChangeFontColor.svelte'
	import ChangeFontSize from './MenuItems/ChangeFontSize.svelte'
	import cardStore from '$lib/stores/cardStore'
	import canvasStore from '$lib/stores/canvasStore'

	const duplicateCard = async () => {
		if ($cardStore.selectedCards.length > 0) {
			const cardIds = $cardStore.selectedCards.map((card: any) => card.getAttribute('id'))

			const newCardIds = await cardStore.duplicateCards(cardIds)

			if (newCardIds) {
				setTimeout(() => {
					const cardEles = newCardIds.map(
						(cardId) => document.getElementById(cardId) as HTMLElement
					)
					cardStore.setSelectedCards(cardEles)
				}, 100)
			}
		}
	}

	const groupCards = () => {
		if ($cardStore.selectedCards.length > 1) {
			const cardIds = $cardStore.selectedCards.map((card: any) => card.getAttribute('id'))
			canvasStore.setGroupedCardIds(cardIds)
		}
	}

	const unGroupCards = () => {
		if ($cardStore.selectedCards.length > 0) {
			const cardIds = $cardStore.selectedCards.map((card: any) => card.getAttribute('id'))
			canvasStore.ungroupCards(cardIds)
		}
	}
</script>

<div class="absolute top-40 z-50 p-2">
	<IconContainer
		tooltipContent="Select (ctrl+shift+s)"
		tooltipPosition="right"
		isMenuActive={$generalStore.isMenuActive.select}
		on:click={() => {
			generalStore.toggleIsMenuActive(MenuItem.select, !$generalStore.isMenuActive.select)
		}}
	>
		<img class="svg-white" src="/icons/cursor-line.svg" alt="icon" />
	</IconContainer>

	<IconContainer
		tooltipContent="Add new card (ctrl+shift+a)"
		tooltipPosition="right"
		isMenuActive={$generalStore.isMenuActive.addNewCard}
		on:click={() => {
			generalStore.toggleIsMenuActive(
				MenuItem.addNewCard,
				!$generalStore.isMenuActive.addNewCard
			)
		}}
	>
		<img class="svg-white" src="/icons/sticky-note-line.svg" alt="icon" />
	</IconContainer>

	<IconContainer
		tooltipContent="Duplicate card (ctrl+d)"
		tooltipPosition="right"
		on:click={() => {
			duplicateCard()
		}}
	>
		<img class="svg-white" src="/icons/file-copy-line.svg" alt="icon" />
	</IconContainer>

	<IconContainer
		tooltipContent="Group cards  (ctrl+g)"
		tooltipPosition="right"
		on:click={() => {
			groupCards()
		}}
	>
		<img class="svg-white" src="/icons/picture-in-picture-exit-line.svg" alt="icon" />
	</IconContainer>

	<IconContainer
		tooltipContent="Ungroup cards (ctrl+shift+g)"
		tooltipPosition="right"
		on:click={() => {
			unGroupCards()
		}}
	>
		<img class="svg-white" src="/icons/picture-in-picture-2-line.svg" alt="icon" />
	</IconContainer>

	<ChangeFontSize />
	<ChangeFontColor />
	<ChangeCardBgColor />
	<ChangeCardBorderStyle />

	<IconContainer
		tooltipContent="Save  (ctrl+s)"
		tooltipPosition="right"
		on:click={() => {
			canvasStore.save()
		}}
	>
		<img class="svg-white" src="/icons/sd-card-line.svg" alt="icon" />
	</IconContainer>

	<IconContainer
		tooltipContent="Delete cards (delete)"
		tooltipPosition="right"
		on:click={() => {
			cardStore.deleteCards($cardStore.selectedCards)
		}}
	>
		<img class="svg-white" src="/icons/delete-bin-2-line.svg" alt="icon" />
	</IconContainer>
</div>
