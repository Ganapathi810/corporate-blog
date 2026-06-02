"use client"

import React, { useRef, useState } from 'react'
import { UploadCloud, Loader2, AlertCircle } from 'lucide-react'
import { NodeViewWrapper } from '@tiptap/react'

const UPLOAD_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/upload`

export const ImageUploadComponent = ({ editor, getPos }: any) => {
    const [isDragging, setIsDragging] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFile = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            setError('Only image files are supported.')
            return
        }
        if (file.size > 5 * 1024 * 1024) {
            setError('File size must be under 5MB.')
            return
        }

        setError(null)
        setIsUploading(true)

        try {
            const formData = new FormData()
            formData.append('file', file)

            const response = await fetch(UPLOAD_URL, {
                method: 'POST',
                credentials: 'include',
                body: formData,
            })

            if (!response.ok) {
                const data = await response.json().catch(() => ({}))
                throw new Error(data?.error || 'Upload failed.')
            }

            const { url, imageId } = await response.json()

            const pos = getPos()
            editor
                .chain()
                .focus()
                .deleteRange({ from: pos, to: pos + 1 })
                .setImage({ src: url, imageId })
                .run()
        } catch (err: any) {
            setError(err.message || 'Something went wrong. Please try again.')
        } finally {
            setIsUploading(false)
        }
    }

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) handleFile(file)
        e.target.value = ''
    }

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        if (isUploading) return
        const file = e.dataTransfer.files?.[0]
        if (file) handleFile(file)
    }

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        if (!isUploading) setIsDragging(true)
    }

    const onDragLeave = () => setIsDragging(false)

    return (
        <NodeViewWrapper className="my-4">
            <div
                onClick={() => !isUploading && fileInputRef.current?.click()}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                className={`
                    relative flex flex-col items-center justify-center py-10 px-6 
                    border-2 border-dashed rounded-xl transition-all
                    ${isUploading ? 'cursor-wait opacity-80' : 'cursor-pointer'}
                    ${isDragging
                        ? 'border-blue-500 bg-blue-50/50'
                        : 'border-gray-200 bg-gray-50/50 hover:bg-gray-100/50 hover:border-gray-300'
                    }
                `}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={onFileChange}
                    accept="image/*"
                    className="hidden"
                    disabled={isUploading}
                />

                <div className="relative mb-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-sm border border-gray-100">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#3B82F6]">
                            {isUploading
                                ? <Loader2 className="size-4 text-white animate-spin" />
                                : <UploadCloud className="size-4 text-white" />
                            }
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    {isUploading ? (
                        <>
                            <p className="text-base font-medium text-gray-700">Uploading...</p>
                            <p className="text-xs text-gray-400 mt-1">Please wait while we upload your image.</p>
                        </>
                    ) : (
                        <>
                            <p className="text-base font-medium text-gray-700">
                                <span className="underline decoration-gray-400 underline-offset-4">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF, WebP — Max 5MB</p>
                        </>
                    )}
                </div>

                {error && (
                    <div className="mt-3 flex items-center gap-1.5 text-red-500 text-xs font-medium">
                        <AlertCircle className="size-3.5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}
            </div>
        </NodeViewWrapper>
    )
}
