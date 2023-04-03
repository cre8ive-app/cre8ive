import { writable, get, type Writable } from 'svelte/store'
import { createDraft, produce } from 'immer'
import type Moveable from 'moveable'
import { objectMap } from '$lib/utils'
import cardStore from './cardStore'
import { COLLECTIONS } from '$lib/constants'
import { pb } from '$lib/pocketbase'

interface IsMenuActive {
	select: boolean
	addNewCard: boolean
	changeCardBgColor: boolean
	changeCardBorder: boolean
}

export enum MenuItem {
	select = 'select',
	addNewCard = 'addNewCard',
	changeCardBgColor = 'changeCardBgColor',
	changeCardBorder = 'changeCardBorder'
}

interface GeneralSettings {
	id: string
	darkMode: boolean
}

interface StoreData {
	moveable: any // TODO: change type
	panzoom: any // TODO: change type
	isMenuActive: IsMenuActive
	preSelectedCards: HTMLElement[]
	showProgress: boolean
	generalSettings: GeneralSettings
}

interface StoreActions extends Writable<StoreData> {
	setMoveable: (moveable: Moveable | null) => void
	setPanzoom: (panzoom: any) => void
	toggleIsMenuActive: (menuItem: MenuItem, status: boolean) => void
	cardSelection: (type: 'preserve' | 'reselect') => void
	toggleShowProgress: (status: boolean) => void
	toggleDarkMode: (status: boolean) => void
	loadGeneralSettings: () => void
	saveGeneralSettings: () => Promise<void>
}

const generalStore = (): StoreActions => {
	const storeData: StoreData = {
		moveable: null,
		panzoom: null,
		isMenuActive: {
			select: true,
			addNewCard: false,
			changeCardBgColor: false,
			changeCardBorder: false
		},
		preSelectedCards: [],
		showProgress: false,
		generalSettings: {
			id: '',
			darkMode: false
		}
	}

	const store = writable<StoreData>(produce(storeData, (draft) => draft))
	const updater = store.update

	return {
		subscribe: store.subscribe,
		set: (): void => {},
		update: (): void => {},

		setMoveable: (moveable) =>
			updater(
				produce((draft) => {
					draft.moveable = moveable
				})
			),

		setPanzoom: (panzoom) =>
			updater(
				produce((draft) => {
					draft.panzoom = panzoom
				})
			),

		toggleIsMenuActive: (menuItem, status) => {
			const resetMenu = objectMap(get(store).isMenuActive, (i: any) => false) as IsMenuActive
			updater(
				produce((draft) => {
					draft.isMenuActive = { ...resetMenu, [menuItem]: status }
				})
			)
		},

		cardSelection: (type) => {
			if (type === 'preserve') {
				updater(
					produce((draft) => {
						draft.preSelectedCards = createDraft(get(cardStore).selectedCards)
					})
				)

				cardStore.setSelectedCards([])
			} else if (type === 'reselect' && get(store).preSelectedCards.length > 0) {
				cardStore.setSelectedCards(get(store).preSelectedCards)

				updater(
					produce((draft) => {
						draft.preSelectedCards = []
					})
				)
			}
		},

		toggleShowProgress: (status) =>
			updater(
				produce((draft) => {
					draft.showProgress = status
				})
			),

		toggleDarkMode: (status) =>
			updater(
				produce((draft) => {
					draft.generalSettings.darkMode = status
				})
			),

		loadGeneralSettings: async () => {
			try {
				const general_settings_res = await pb
					.collection(COLLECTIONS.GENERAL_SETTINGS).getFullList()

				if (general_settings_res.length !== 1) return

				const general_settings = general_settings_res[0]

				updater(
					produce((draft) => {
						draft.generalSettings = { 
							id: general_settings.id,
							darkMode: general_settings.dark_mode
						}
					})
				)
			} catch (e: any) {
				console.error('failed to loadGeneralSettings', e)
				console.info('error data', e.data)
			}
		},

		saveGeneralSettings: async () => {
			const generalSettings = get(store).generalSettings

			try {
				storeInit.toggleShowProgress(true)

				await pb.collection(COLLECTIONS.GENERAL_SETTINGS).update(generalSettings.id, {
					dark_mode: generalSettings.darkMode,
				})

				storeInit.toggleShowProgress(false)
			} catch (e: any) {
				storeInit.toggleShowProgress(false)

				console.error('failed to saveGeneralSettings', e)
				console.info('error data', e.data)
			}
		},
	}
}

const storeInit = generalStore()
export default storeInit
