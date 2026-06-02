import { Node, ReactNodeViewRenderer } from '@tiptap/react'
import { ImageUploadComponent } from './image-upload-component'

export const ImageUpload = Node.create({
  name: 'imageUpload',
  group: 'block',
  atom: true,
  draggable: true,

  parseHTML() {
    return [
      {
        tag: 'div[data-type="image-upload"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { 'data-type': 'image-upload', ...HTMLAttributes }]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageUploadComponent)
  },
})
