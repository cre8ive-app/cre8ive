import { writable, get, type Writable } from 'svelte/store'
import { produce, enableMapSet, createDraft } from 'immer'
import { pb } from '$lib/pocketbase'
import { nanoid } from 'nanoid'
import { roundup, srcToFile } from '$lib/utils'
import canvasStore from './canvasStore'
import generalStore from './generalStore'

enableMapSet()

export type CardStyle = {
	backgroundColor?: string
	color?: string
	transform?: string
	width?: string
	height?: string
	border?: string
}

export type CardSettings = {
	borderStyle?: string
}

export type Card = {
	id: string
	type: string
	width: number | string
	height: number | string
	top: number
	left: number
	style: CardStyle
	content?: string
	media?: string
	settings?: CardSettings
}

interface StoreData {
	cards: Map<string, Card>
	selectedCards: HTMLElement[]
	activeEditorId: string | null
	cardsToSave: Set<string>
}

type newCardIds = string[]

interface StoreActions extends Writable<StoreData> {
	addCard: (id: string, card: Card | FormData) => void
	loadCards: (projectId: string, canvasId: string) => void
	setSelectedCards: (cards: HTMLElement[]) => void
	updateCard: (cardId: string, data: Partial<Card>) => void
	setActiveEditorId: (cardId: string | null) => void
	deleteCards: (cards: HTMLElement[]) => void
	addCardsToSave: (cardId: string[]) => void
	saveCards: () => Promise<void>
	duplicateCards: (cardIds: string[]) => Promise<newCardIds | null>
	clearCards: () => void
}

const cardStore = (): StoreActions => {
	const storeData: StoreData = {
		cards: new Map(),
		selectedCards: [],
		activeEditorId: null,
		cardsToSave: new Set()
	}

	const store = writable<StoreData>(produce(storeData, (draft) => draft))
	const updater = store.update

	return {
		subscribe: store.subscribe,
		set: (): void => {},
		update: (): void => {},

		loadCards: async (projectId, canvasId) => {
			generalStore.toggleShowProgress(true)

			updater(
				produce((draft) => {
					draft.cards = new Map()
				})
			)

			try {
				const cardsData = await pb.collection('cards').getFullList({
					filter: `deleted = false && canvas_id = '${canvasId}'`
				})

				updater(
					produce((draft) => {
						for (const card of cardsData) {
							draft.cards.set(card.id, {
								id: card.id,
								type: card.type,
								top: card.top,
								left: card.left,
								width: card.width,
								height: card.height,
								style: card.style,
								content: card.content,
								media: card.media,
								settings: card.settings,
							})
						}
					})
				)

				generalStore.toggleShowProgress(false)
			} catch (e: any) {
				generalStore.toggleShowProgress(false)

				console.error('failed to loadCards', e)
				console.info('error data', e.data)
			}
		},

		addCard: async (id, card) => {
			if (get(store).cards.get(id)) return false

			generalStore.toggleShowProgress(true)

			try {
				// TODO: subscribe to pocketbase realtime event?
				const res = await pb.collection('cards').create(card, { $autoCancel: false })

				const newCardData = {
					id: res.id,
					canvas_id: res.canvas_id,
					type: res.type,
					width: res.width,
					height: res.height,
					top: res.top,
					left: res.left,
					style: res.style,
					content: res.content,
					media: res.media,
					settings: res.settings,
				}

				updater(
					produce((draft) => {
						draft.cards.set(id, newCardData)
					})
				)

				canvasStore.setIsUnSaved('cardAdded')
				generalStore.toggleShowProgress(false)
			} catch (e: any) {
				generalStore.toggleShowProgress(false)

				console.error('failed to addCard', e)
				console.info('error data', e.data)
			}
		},

		setSelectedCards: (cards) =>
			updater(
				produce((draft) => {
					draft.selectedCards = createDraft(cards)
				})
			),

		// TODO: should also update DB directly?
		updateCard: (cardId, data) =>
			updater(
				produce((draft) => {
					const card = get(store).cards.get(cardId)

					if (!card) return false

					draft.cards.set(cardId, {
						...card,
						...data,
						style: { ...card.style, ...data.style },
						settings: { ...card.settings, ...data.settings },
					})
				})
			),

		setActiveEditorId: (cardId) =>
			updater(
				produce((draft) => {
					draft.activeEditorId = cardId
				})
			),

		deleteCards: (cards) => {
			generalStore.toggleShowProgress(true)

			cards.map(async (ele: HTMLElement) => {
				const id = ele.getAttribute('id') as string
				try {
					await pb.collection('cards').update(id, { deleted: true })

					updater(
						produce((draft) => {
							draft.cards.delete(id)
						})
					)
				} catch (e: any) {
					generalStore.toggleShowProgress(false)

					console.error('failed to deleteCards', e)
					console.info('card id', id)
					console.info('error data', e.data)
				}
			})

			// TODO: handle error
			updater(
				produce((draft) => {
					draft.selectedCards = []
				})
			)

			canvasStore.setIsUnSaved('cardDeleted')
			generalStore.toggleShowProgress(false)
		},

		addCardsToSave: (cardIds) => {
			updater(
				produce((draft) => {
					cardIds.map((id) => {
						draft.cardsToSave.add(id)
					})
				})
			)
		},

		// TODO: handle error
		saveCards: async () => {
			generalStore.toggleShowProgress(true)

			const cardsToSave = [...get(store).cardsToSave]

			cardsToSave.map(async (cardId: string) => {
				try {
					const card = get(store).cards.get(cardId)

					// TODO: handle undo/redo when implemented
					await pb.collection('cards').update(
						cardId,
						{
							width: card?.width,
							height: card?.height,
							top: card?.top,
							left: card?.left,
							style: card?.style,
							content: card?.content,
							settings: card?.settings,
						},
						{ $autoCancel: false }
					)
				} catch (e: any) {
					generalStore.toggleShowProgress(false)

					console.error('failed to saveCards', e)
					console.info('card id', cardId)
					console.info('error data', e.data)
					throw e
				}
			})

			// TODO: do this only if cards are saved successfully
			updater(
				produce((draft) => {
					draft.cardsToSave = new Set()
				})
			)

			generalStore.toggleShowProgress(false)
		},

		duplicateCards: async (cardIds) => {
			generalStore.toggleShowProgress(true)

			const newCards = new Map()
			const canvasId = get(canvasStore).canvasSettings.id

			if (!canvasId) {
				console.error('Canvas ID not found to duplicate cards')

				generalStore.toggleShowProgress(false)

				return null
			}

			// TODO: reuse addCard()?
			try {
				for (const cardId of cardIds) {
					const card = { ...(get(store).cards.get(cardId) as Card), canvas_id: canvasId }
					const id = nanoid(15)
					const top = roundup(card.top + 50)
					const left = roundup(card.left + 50)
					const width = card.width + ''
					const height = card.height + ''

					card.id = id
					card.top = top
					card.left = left
					card.style = { ...card.style, transform: `translate(${left}px, ${top}px)` }

					if (card.type === 'text') {
						newCards.set(card.id, card)
						await pb.collection('cards').create(card, { $autoCancel: false })
					} else if (card.type === 'image') {
						// TODO: make this dynamic
						const fileUrl = `http://127.0.0.1:8090/api/files/cards/${cardId}/${card.media}`

						const file = await srcToFile(fileUrl, id)
						if (!file) continue

						const formData = new FormData()
						formData.append('id', id)
						formData.append('canvas_id', canvasId)
						formData.append('type', 'image')
						formData.append('width', width)
						formData.append('height', height)
						formData.append('top', top + '')
						formData.append('left', left + '')
						formData.append(
							'style',
							JSON.stringify({
								...card.style,
								transform: `translate(${left}px, ${top}px)`
							})
						)
						formData.append(
							'settings',
							JSON.stringify(card.settings)
						)
						formData.append('content', '')
						formData.append('media', file)

						const res = await pb
							.collection('cards')
							.create(formData, { $autoCancel: false })

						card.media = res.media
						newCards.set(card.id, card)
					}
				}

				updater(
					produce((draft) => {
						;[...newCards.keys()].map((cardId) => {
							draft.cards.set(cardId, newCards.get(cardId))
						})
					})
				)

				canvasStore.setIsUnSaved('cardDuplicated')
				generalStore.toggleShowProgress(false)

				return [...newCards.keys()] as newCardIds
			} catch (e: any) {
				generalStore.toggleShowProgress(false)

				console.error('failed to duplicateCards', e)
				console.info('error data', e.data)

				return null
			}
		},

		clearCards: () => {
			updater(produce(draft => {
				draft.cards = new Map()
			}))
		}
	}
}

const storeInit = cardStore()
export default storeInit
