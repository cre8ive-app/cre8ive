import { onDestroy } from 'svelte'
import screenfull from 'screenfull'

export const convertScaleToZoomPer = (scale: number) => {
	const rounded = Math.floor(scale * 100)
	return Math.ceil(rounded / 5) * 5 // Round up to the next multiple of 5
}

// Round up number to two decimal places
export const roundup = (num: number) => {
	return Math.round((num + Number.EPSILON) * 100) / 100
}

// Convert src url to File
// TODO: Handle negative cases
export const srcToFile = async (src: string, filename?: string) => {
	filename = filename || (src.split('/').pop()?.split('#')[0].split('?')[0] as string)
	let srcMimeType: string | null = null

	return fetch(src)
		.then((res) => {
			srcMimeType = res.headers.get('Content-Type') as string
			return res.arrayBuffer()
		})
		.then((buf) => {
			if (!filename || !srcMimeType) {
				return false
			}

			return new File([buf], filename, { type: srcMimeType })
		})
}

export const objectMap = (obj: Object, fn: Function) =>
	Object.fromEntries(Object.entries(obj).map(([k, v], i) => [k, fn(v, k, i)]))

/**
 * usage:
 * await delay(2000)
 */
export const delay = (delay: number) => new Promise((resolve) => setTimeout(resolve, delay))

export const findMouseButton = (buttonIndex: Number) => {
	switch (buttonIndex) {
		case 0:
			return 'left'
		case 1:
			return 'middle'
		case 2:
			return 'right'
		default:
			return null
	}
}

export const mouseCoords = (event: PointerEvent | MouseEvent, scale: number): { left: number, top: number } | null => {
	const canvas = document.getElementById('canvas-container')

	if (!canvas) return null

	const rect = canvas.getBoundingClientRect()
	const top = roundup((event.pageY - rect.top) / scale)
	const left = roundup((event.pageX - rect.left) / scale)

	return { left, top }
}

export const isFullScreen = () => {
	return screenfull.isFullscreen
}

export const onInterval = (callback: Function, milliseconds: number) => {
	const interval = setInterval(callback, milliseconds)

	onDestroy(() => {
		clearInterval(interval)
	})
}
