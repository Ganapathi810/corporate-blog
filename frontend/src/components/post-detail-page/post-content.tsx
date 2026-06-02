"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import Superscript from '@tiptap/extension-superscript'
import Subscript from '@tiptap/extension-subscript'
import TextAlign from '@tiptap/extension-text-align'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableCell } from '@tiptap/extension-table-cell'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import Image from '@tiptap/extension-image'

interface PostContentProps {
    content: any
}

export const PostContent = ({ content }: PostContentProps) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Highlight.configure({ multicolor: true }),
            Underline,
            Link.configure({
                openOnClick: false,
                autolink: true,
                defaultProtocol: 'https',
            }),
            TextStyle,
            Color,
            Superscript,
            Subscript,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            Image.extend({
                addAttributes() {
                    return {
                        ...this.parent?.(),
                        imageId: {
                            default: null,
                            parseHTML: element => element.getAttribute('data-image-id'),
                            renderHTML: attributes => {
                                if (!attributes.imageId) return {}
                                return { 'data-image-id': attributes.imageId }
                            },
                        },
                    }
                },
            }),
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
        ],
        content,
        editable: false,
        immediatelyRender: false,
    })
    
    return (
        <div className="prose prose-blue lg:prose-xl max-w-none prose-img:rounded-xl prose-headings:tracking-tight prose-a:text-blue-600">
            <EditorContent editor={editor} />
        </div>
    )
}