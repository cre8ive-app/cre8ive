<script lang="ts">
	import { afterUpdate } from 'svelte'
	import Editor from '@tinymce/tinymce-svelte'
	import cardStore from '$lib/stores/cardStore'

	let editorRef: any
	export let cardId: string = ''
	export let isDisabled: boolean = true
	export let content: string = ''

	afterUpdate(() => {
		// TODO: is it good to do this here?
		// every single keypress updates store
		if (editorRef) {
			const id = editorRef.targetElm.closest('.card').getAttribute('id')
			const content = editorRef.getContent({ format: 'raw' })

			cardStore.updateCard(id, { content })
		}
	})

	const editorSetup = (ed: any) => {
		ed.on('init', () => {
			editorRef = ed
		})

		ed.on('blur', () => {
			cardStore.setActiveEditorId(null)
		})
	}
</script>

<Editor
	id={`ed_${cardId}`}
	scriptSrc={'/tinymce/tinymce.min.js'}
	inline={true}
	disabled={isDisabled}
	modelEvents="input change undo redo"
	bind:value={content}
	conf={{
		menubar: false,
		elementpath: false,
		branding: false,
		plugins: ['lists', 'image', 'table'],
		fixed_toolbar_container: '#toolbar-container',
		toolbar:
			'bold italic underline strikethrough backcolor | ' +
			'alignleft aligncenter ' +
			'alignright alignjustify | bullist numlist outdent indent | ' +
			'removeformat',
		setup: editorSetup
	}}
/>
