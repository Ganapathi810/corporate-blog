"use client";

import { forwardRef, useEffect, useImperativeHandle, useState, useRef } from 'react'
import { Extension } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'
import { ReactRenderer } from '@tiptap/react'
import {
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  List,
  ListOrdered,
  Text,
  ListTodo,
  Quote,
  CodeSquare,
  Table as TableIcon,
  Minus,
  Image as ImageIcon
} from 'lucide-react'

// --- 1. Define the actual dropdown UI ---
export const CommandList = forwardRef((props: any, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const selectedRef = useRef<HTMLButtonElement>(null)

  const selectItem = (index: number) => {
    const item = props.items[index]
    if (item) {
      props.command(item)
    }
  }

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length)
  }

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length)
  }

  const enterHandler = () => {
    selectItem(selectedIndex)
  }

  useEffect(() => setSelectedIndex(0), [props.items])

  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({
        behavior: 'auto',
        block: 'nearest',
      })
    }
  }, [selectedIndex])

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: any) => {
      if (event.key === 'ArrowUp') {
        upHandler()
        event.preventDefault()
        return true
      }

      if (event.key === 'ArrowDown') {
        downHandler()
        event.preventDefault()
        return true
      }

      if (event.key === 'Enter') {
        enterHandler()
        event.preventDefault()
        return true
      }

      return false
    },
  }))

  const groupedItems = props.items.reduce((acc: any, item: any, index: number) => {
    if (!acc[item.group]) acc[item.group] = []
    acc[item.group].push({ ...item, originalIndex: index })
    return acc
  }, {})

  return (
    <div className="max-h-80 overflow-y-auto z-50 bg-white border border-gray-100 rounded-sm shadow-lg p-2 w-64 animate-in fade-in zoom-in-95 duration-200">
      {props.items.length ? (
        Object.entries(groupedItems).map(([group, items]: any, groupIndex) => (
          <div key={group}>
            {groupIndex > 0 && <hr className="my-1.5 border-gray-200" />}
            <div className="px-2 py-1.5 text-xs font-bold text-gray-800">
              {group}
            </div>
            {items.map((item: any) => {
              const matches = item.originalIndex === selectedIndex
              return (
                <button
                  ref={matches ? selectedRef : null}
                  className={`w-full flex items-center gap-3 px-2 py-1.5 text-sm rounded-sm transition-colors text-left group cursor-pointer ${
                    matches ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                  key={item.originalIndex}
                  onClick={() => selectItem(item.originalIndex)}
                >
                  {group !== 'AI' && (
                  <div className={`flex items-center justify-center w-7 h-7 rounded-sm border bg-white shadow-sm ${
                      matches ? 'border-blue-200' : 'border-gray-50 group-hover:border-blue-200'
                  }`}>
                      <div className={matches ? "text-blue-600" : "text-gray-500 group-hover:text-blue-600"}>
                          {item.icon}
                      </div>
                  </div>
                  )}
                  {group === 'AI' && (
                      <div className="flex items-center justify-center w-7 h-7">
                          {item.icon}
                      </div>
                  )}
                  <div className="flex flex-col">
                      <span className="font-medium">{item.title}</span>
                  </div>
                </button>
              )
            })}
          </div>
        ))
      ) : (
        <div className="px-2 py-4 text-sm text-center text-gray-500">
          No result
        </div>
      )}
    </div>
  )
})

CommandList.displayName = 'CommandList'

// --- 2. Define the exact items to show ---
export const getSuggestionItems = ({ query }: { query: string }) => {
  return [
    {
      title: 'Text',
      group: 'Style',
      icon: <Text className="size-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setNode('paragraph').run()
      },
    },
    {
      title: 'Heading 1',
      group: 'Style',
      icon: <Heading1 className="size-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run()
      },
    },
    {
      title: 'Heading 2',
      group: 'Style',
      icon: <Heading2 className="size-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run()
      },
    },
    {
      title: 'Heading 3',
      group: 'Style',
      icon: <Heading3 className="size-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run()
      },
    },
    {
      title: 'Heading 4',
      group: 'Style',
      icon: <Heading4 className="size-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 4 }).run()
      },
    },
    {
      title: 'Heading 5',
      group: 'Style',
      icon: <Heading5 className="size-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 5 }).run()
      },
    },
    {
      title: 'Bullet List',
      group: 'Style',
      icon: <List className="size-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run()
      },
    },
    {
      title: 'Numbered List',
      group: 'Style',
      icon: <ListOrdered className="size-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleOrderedList().run()
      },
    },
    {
      title: 'Blockquote',
      group: 'Style',
      icon: <Quote className="size-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleBlockquote().run()
      },
    },
    {
      title: 'Code Block',
      group: 'Style',
      icon: <CodeSquare className="size-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleCodeBlock().run()
      },
    },
    {
      title: 'Table',
      group: 'Insert',
      icon: <TableIcon className="size-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
      },
    },
    {
      title: 'Separator',
      group: 'Insert',
      icon: <Minus className="size-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setHorizontalRule().run()
      },
    },
    {
      title: 'Image',
      group: 'Upload',
      icon: <ImageIcon className="size-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).insertContent({ type: 'imageUpload' }).run()
      },
    },
  ].filter(item => item.title.toLowerCase().startsWith(query.toLowerCase())).slice(0, 15)
}

// --- 3. Construct the suggestion configuration for Floating UI ---
import { computePosition, offset, flip, shift } from '@floating-ui/dom'

export const suggestionConfig = {
  items: getSuggestionItems,
  render: () => {
    let component: ReactRenderer
    let popup: HTMLDivElement

    return {
      onStart: (props: any) => {
        component = new ReactRenderer(CommandList, {
          props,
          editor: props.editor,
        })

        if (!props.clientRect) {
          return
        }

        popup = document.createElement('div')
        Object.assign(popup.style, {
          position: 'absolute',
          left: '0',
          top: '0',
          zIndex: '9999',
        })

        popup.appendChild(component.element)
        document.body.appendChild(popup)

        const updatePosition = () => {
          if (!props.clientRect) return
          const rect = props.clientRect()
          
          if (!rect) return
          
          const virtualEl = {
            getBoundingClientRect: () => rect,
          }
          
          computePosition(virtualEl, popup, {
            placement: 'bottom-start',
            middleware: [offset(5), flip(), shift({ padding: 5 })],
          }).then(({ x, y }) => {
            Object.assign(popup.style, {
              left: `${x}px`,
              top: `${y}px`,
            })
          })
        }

        updatePosition()

        props.editor.view.dom.classList.add('slash-command-active')
        if (props.query === '') {
          props.editor.view.dom.classList.add('slash-command-empty')
        }
      },

      onUpdate(props: any) {
        component.updateProps(props)

        if (props.query === '') {
          props.editor.view.dom.classList.add('slash-command-empty')
        } else {
          props.editor.view.dom.classList.remove('slash-command-empty')
        }

        if (!props.clientRect) {
          return
        }

        const rect = props.clientRect()
        if (!rect) return
          
        const virtualEl = {
          getBoundingClientRect: () => rect,
        }
          
        computePosition(virtualEl, popup, {
          placement: 'bottom-start',
          middleware: [offset(5), flip(), shift({ padding: 5 })],
        }).then(({ x, y }) => {
          Object.assign(popup.style, {
            left: `${x}px`,
            top: `${y}px`,
          })
        })
      },

      onKeyDown(props: any) {
        if (props.event.key === 'Escape') {
          if (popup && popup.parentNode) {
            popup.style.display = 'none'
          }
          return true
        }

        return (component.ref as any)?.onKeyDown(props)
      },

      onExit(props: any) {
        if (popup && popup.parentNode) {
          popup.parentNode.removeChild(popup)
        }
        if (props.editor?.view?.dom) {
          props.editor.view.dom.classList.remove('slash-command-active')
          props.editor.view.dom.classList.remove('slash-command-empty')
        }
        component.destroy()
      },
    }
  },
}

// --- 4. The Extension to register in Tiptap ---
export const SlashCommands = Extension.create({
  name: 'slashCommands',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        decorationClass: 'slash-command-suggestion',
        command: ({ editor, range, props }: any) => {
          props.command({ editor, range })
        },
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ]
  },
})
