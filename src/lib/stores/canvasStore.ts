import { writable, get, type Writable } from 'svelte/store'
import { produce } from 'immer'
import { pb } from '$lib/pocketbase'
import { roundup } from '$lib/utils'
import cardStore from './cardStore'
import generalStore from './generalStore'
import { nanoid } from 'nanoid'
import { COLLECTIONS } from '$lib/constants'

type Space = {
	id: string
	name: string
	is_default: boolean
}

type Canvas = {
	id: string
	space_id: string
	name: string
}

type CanvasSettings = {
	id: string | null
	space_id: string | null
	name: string
	scale: number
	pan: { top: number; left: number }
}

type SetBy =
	| 'cardDragged'
	| 'cardGroupDragged'
	| 'cardResized'
	| 'cardGroupResized'
	| 'textUpdated'
	| 'cardBorderChanged'
	| 'cardBGColorChanged'
	| 'cardGrouped'
	| 'cardUnGrouped'
	| 'cardDeleted'
	| 'cardAdded'
	| 'cardDuplicated'
	| 'canvasPanned'
	| 'canvasZoomed'
	| 'darkModeChanged'
	| 'cardFontSizeChanged'
	| 'cardFontColorChanged'

interface StoreData {
	space: Space[]
	activeSpaceId: string | null
	canvas: Map<string, Canvas>
	canvasSettings: CanvasSettings
	groupedCardIds: string[][]
	isSaving: boolean
	isUnSaved: SetBy | null
}

type defaultSpace = Space

interface StoreActions extends Writable<StoreData> {
	loadSpace: () => Promise<defaultSpace | null>
	setActiveSpaceId: (spaceId: string | null) => void
	loadCanvas: (spaceId: string) => void
	loadCanvasSettings: (spaceId: string, canvasId: string) => Promise<CanvasSettings | null>
	updateCanvasTransform: (left: number, top: number, scale: number) => void
	saveCanvasSettings: () => Promise<void>
	saveGroupedCards: () => Promise<void>
	getCardGroup: (cardId: string) => { groupIndex: number; groupCardIds: string[] } | null
	setGroupedCardIds: (cardIds: string[]) => void
	ungroupCards: (cardIds: string[]) => void
	setIsUnSaved: (setBy: SetBy | null) => void
	save: () => void
	createCanvas: (canvasName: string) => Promise<{ spaceId?: string; newCanvasId?: string }>
	renameCanvas: (canvasId: string, canvasName: string) => Promise<void>
	deleteCanvas: (spaceId: string, canvasId: string) => Promise<boolean>
}

const canvasStore = (): StoreActions => {
	const storeData: StoreData = {
		space: [],
		activeSpaceId: null,
		canvas: new Map(),
		canvasSettings: {
			id: null,
			space_id: null,
			name: '',
			scale: 1,
			pan: { top: 0, left: 0 }
		},
		groupedCardIds: [],
		isSaving: false,
		isUnSaved: null
	}

	const store = writable<StoreData>(produce(storeData, (draft) => draft))
	const updater = store.update

	return {
		subscribe: store.subscribe,
		set: (): void => {},
		update: (): void => {},

		loadSpace: async () => {
			updater(
				produce((draft) => {
					draft.space = []
				})
			)

			try {
				generalStore.toggleShowProgress(true)

				// const res = await pb.collection(COLLECTIONS.SPACE).getFullList()

				// updater(
				// 	produce((draft) => {
				// 		res.map(i => {
				// 			draft.projects.push({ id: i.id, name: i.name, is_default: i.is_default })
				// 		})
				// 	})
				// )

				// generalStore.toggleShowProgress(false)

				const defaultSpace = await pb
					.collection(COLLECTIONS.SPACE)
					.getFirstListItem('is_default=true')

				updater(
					produce((draft) => {
						draft.space = [
							{
								id: defaultSpace.id,
								name: defaultSpace.name,
								is_default: defaultSpace.is_default
							}
						]
					})
				)

				return {
					id: defaultSpace.id,
					name: defaultSpace.name,
					is_default: defaultSpace.is_default
				} as Space
			} catch (e: any) {
				generalStore.toggleShowProgress(false)

				console.error('failed to loadSpace', e)
				console.info('error data', e.data)

				return null
			}
		},

		setActiveSpaceId: (spaceId) => {
			updater(
				produce((draft) => {
					draft.activeSpaceId = spaceId
				})
			)
		},

		loadCanvas: async (spaceId) => {
			try {
				generalStore.toggleShowProgress(true)

				const res = await pb.collection(COLLECTIONS.CANVAS).getFullList({
					filter: `deleted = false && space_id = '${spaceId}'`
				})

				updater(
					produce((draft) => {
						for (const canvas of res) {
							draft.canvas.set(canvas.id, {
								id: canvas.id,
								name: canvas.name,
								space_id: canvas.space_id
							})
						}
					})
				)

				generalStore.toggleShowProgress(false)
			} catch (e: any) {
				generalStore.toggleShowProgress(false)

				console.error('failed to loadCanvas', e)
				console.info('error data', e.data)
			}
		},

		loadCanvasSettings: async (spaceId, canvasId) => {
			try {
				generalStore.toggleShowProgress(true)

				const canvasSettings = await pb.collection(COLLECTIONS.CANVAS).getOne(canvasId, {
					space_id: spaceId
				})

				const data = {
					id: canvasSettings.id,
					space_id: canvasSettings.space_id,
					name: canvasSettings.name,
					scale: canvasSettings.zoom,
					pan: canvasSettings.pan
				}

				updater(
					produce((draft) => {
						draft.canvasSettings = data
						draft.groupedCardIds = canvasSettings.grouped_card_ids
					})
				)

				generalStore.toggleShowProgress(false)

				return data as CanvasSettings
			} catch (e: any) {
				generalStore.toggleShowProgress(false)

				console.error('failed to loadCanvasSettings', e)
				console.info('error data', e.data)

				return null
			}
		},

		updateCanvasTransform: (left, top, scale) => {
			updater(
				produce((draft) => {
					draft.canvasSettings.pan = { left: roundup(left), top: roundup(top) }
					draft.canvasSettings.scale = roundup(scale)
				})
			)
		},

		saveCanvasSettings: async () => {
			const canvasSettings = get(store).canvasSettings
			const groupedCardIds = get(store).groupedCardIds

			if (!canvasSettings.id) return

			try {
				generalStore.toggleShowProgress(true)

				await pb.collection(COLLECTIONS.CANVAS).update(canvasSettings.id, {
					space_id: canvasSettings.space_id,
					name: canvasSettings.name,
					zoom: canvasSettings.scale,
					pan: canvasSettings.pan,
					grouped_card_ids: groupedCardIds
				})

				generalStore.toggleShowProgress(false)
			} catch (e: any) {
				generalStore.toggleShowProgress(false)

				console.error('failed to saveCanvasSettings', e)
				console.info('error data', e.data)
			}
		},

		saveGroupedCards: async () => {
			const canvasSettings = get(store).canvasSettings
			const groupedCardIds = get(store).groupedCardIds

			try {
				await pb.collection(COLLECTIONS.CANVAS).update(
					canvasSettings.id as string,
					{
						grouped_card_ids: groupedCardIds
					},
					{ $autoCancel: false }
				)
			} catch (e: any) {
				console.error('failed to saveGroupedCards', e)
				console.info('error data', e.data)
			}
		},

		getCardGroup: (cardId) => {
			const groupIndex = get(store).groupedCardIds.findIndex(
				(cardIds) => cardIds.indexOf(cardId) > -1
			)

			return groupIndex > -1
				? {
						groupIndex,
						groupCardIds: get(store).groupedCardIds[groupIndex]
				  }
				: null
		},

		setGroupedCardIds: async (cardIds) => {
			if (cardIds.length <= 1) return false

			generalStore.toggleShowProgress(true)

			const currentGroupedCardIds: string[] = []

			for (const selectedCardId of cardIds) {
				// TODO: remove this, reuse getCardGroup()
				const groupIndex = get(store).groupedCardIds.findIndex(
					(cardIds) => cardIds.indexOf(selectedCardId) > -1
				)

				const cardGroup =
					groupIndex > -1
						? {
								groupIndex,
								groupCardIds: get(store).groupedCardIds[groupIndex]
						  }
						: null

				if (cardGroup) {
					updater(
						produce((draft) => {
							// delete current group of the card
							draft.groupedCardIds.splice(cardGroup.groupIndex, 1)

							// get cards in current group
							currentGroupedCardIds.push(...cardGroup.groupCardIds)
						})
					)
				}
			}

			// This will create new card group with unique card ids and
			// if the selected card was already in other group, remaining cards
			// will be added to this group because
			// card cannot belong to multiple groups
			const newCardGroup = [...new Set([...cardIds, ...currentGroupedCardIds])]

			try {
				updater(
					produce((draft) => {
						draft.groupedCardIds.push(newCardGroup)
					})
				)

				setTimeout(async () => {
					// TODO: instead of setTimeout, do this after store update confirmation
					await storeInit.saveGroupedCards()
				}, 300)

				produce((draft) => {
					draft.isUnSaved = 'cardGrouped'
				})

				generalStore.toggleShowProgress(false)
			} catch (e: any) {
				generalStore.toggleShowProgress(false)

				console.error('failed to setGroupedCardIds', e)
				console.info('error data', e.data)
			}
		},

		ungroupCards: async (cardIds) => {
			generalStore.toggleShowProgress(true)

			// One card cannot belong to multiple groups.
			// So removing group based on one cardId works fine.
			const cardId = cardIds[0]

			// TODO: reuse getCardGroup()
			const groupIndex = get(store).groupedCardIds.findIndex(
				(cardIds) => cardIds.indexOf(cardId) > -1
			)

			const cardGroup =
				groupIndex > -1
					? {
							groupIndex,
							groupCardIds: get(store).groupedCardIds[groupIndex]
					  }
					: null

			if (!cardGroup) {
				generalStore.toggleShowProgress(false)
				return false
			}

			try {
				updater(
					produce((draft) => {
						draft.groupedCardIds.splice(cardGroup.groupIndex, 1)
					})
				)

				setTimeout(async () => {
					// TODO: instead of setTimeout, do this after store update confirmation
					await storeInit.saveGroupedCards()
				}, 300)

				produce((draft) => {
					draft.isUnSaved = 'cardUnGrouped'
				})

				generalStore.toggleShowProgress(false)
			} catch (e: any) {
				generalStore.toggleShowProgress(false)

				console.error('failed to ungroupCards', e)
				console.info('error data', e.data)
			}
		},

		setIsUnSaved: (setBy) => {
			updater(
				produce((draft) => {
					draft.isUnSaved = setBy
				})
			)
		},

		save: async () => {
			if (!get(store).isUnSaved) {
				return false
			}

			try {
				updater(
					produce((draft) => {
						draft.isSaving = true
					})
				)

				// TODO: change isUnSaved to list of unsaved events and onSave save only that
				await cardStore.saveCards()
				await storeInit.saveCanvasSettings()
				await generalStore.saveGeneralSettings()

				updater(
					produce((draft) => {
						draft.isUnSaved = null
						draft.isSaving = false
					})
				)
			} catch (e: any) {
				updater(
					produce((draft) => {
						draft.isSaving = false
					})
				)

				console.error('save error', e)
				console.info('error data', e.data)
			}
		},

		createCanvas: async (canvasName) => {
			generalStore.toggleShowProgress(true)

			try {
				// TODO: remove this when creating and navigating spaces are enabled
				const defaultSpace = await pb
					.collection(COLLECTIONS.SPACE)
					.getFirstListItem('is_default=true')

				const id = nanoid(15)

				const newCanvas = {
					id,
					space_id: defaultSpace.id,
					name: canvasName,
					zoom: 1,
					pan: { left: 0, top: 0 },
					grouped_card_ids: []
				}

				await pb.collection(COLLECTIONS.CANVAS).create(newCanvas)

				generalStore.toggleShowProgress(false)

				return { spaceId: defaultSpace.id, newCanvasId: id }
			} catch (e: any) {
				generalStore.toggleShowProgress(false)

				console.error('failed to createCanvas', e)
				console.info('error data', e.data)

				return {}
			}
		},

		renameCanvas: async (canvasId, canvasName) => {
			generalStore.toggleShowProgress(true)

			try {
				await pb.collection(COLLECTIONS.CANVAS).update(canvasId, {
					name: canvasName
				})

				const canvas = { ...get(store).canvas.get(canvasId) } as Canvas

				updater(
					produce((draft) => {
						draft.canvas.set(canvasId, { ...canvas, name: canvasName })
					})
				)

				generalStore.toggleShowProgress(false)
			} catch (e: any) {
				generalStore.toggleShowProgress(false)

				console.error('failed to renameCanvas', e)
				console.info('error data', e.data)
			}
		},

		deleteCanvas: async (spaceId, canvasId) => {
			generalStore.toggleShowProgress(true)

			try {
				// TODO: I had to first get card ids to delete because
				// pocketbase does not support multiple records update in single query :(
				// fix this when pocketbase supports it
				await pb
					.collection(COLLECTIONS.CARDS)
					.getFullList({
						filter: `deleted = false && canvas_id = '${canvasId}'`
					})
					.then(async (cards) => {
						for (const card of cards) {
							await pb
								.collection(COLLECTIONS.CARDS)
								.update(card.id, { deleted: true, $autoCancel: false })
						}
					})

				await pb.collection(COLLECTIONS.CANVAS).update(canvasId, { deleted: true })

				updater(
					produce((draft) => {
						draft.canvas.delete(canvasId)
					})
				)

				generalStore.toggleShowProgress(false)

				return true
			} catch (e: any) {
				generalStore.toggleShowProgress(false)

				console.error('failed to deleteCanvas', e)
				console.info('error data', e.data)

				return false
			}
		}
	}
}

const storeInit = canvasStore()
export default storeInit
