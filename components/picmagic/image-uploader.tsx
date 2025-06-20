"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { UploadCloud, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface ImageUploaderProps {
  onImageUpload: (file: File | null) => void
  uploadedImage: File | null
}

export function ImageUploader({ onImageUpload, uploadedImage }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        const file = acceptedFiles[0]
        onImageUpload(file)
        setPreview(URL.createObjectURL(file))
      }
    },
    [onImageUpload],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [], "image/png": [], "image/gif": [] },
    multiple: false,
  })

  const removeImage = () => {
    onImageUpload(null)
    if (preview) {
      URL.revokeObjectURL(preview)
    }
    setPreview(null)
  }

  return (
    <div className="p-4 border border-dashed rounded-lg text-center cursor-pointer hover:border-primary transition-colors bg-muted/40">
      {preview && uploadedImage ? (
        <div className="relative group">
          <Image
            src={preview || "/placeholder.svg"}
            alt="图片预览"
            width={200}
            height={200}
            className="mx-auto rounded-md object-contain max-h-64"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation()
              removeImage()
            }}
            aria-label="移除图片"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div {...getRootProps()} className="space-y-1 py-2">
          <input {...getInputProps()} />
          <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
          {isDragActive ? (
            <p className="text-primary">将图片拖到此处</p>
          ) : (
            <p className="text-muted-foreground">
              拖拽图片到这里，或 <span className="text-primary">点击上传</span>
            </p>
          )}
          <p className="text-xs text-muted-foreground">支持 JPG, PNG, GIF格式</p>
        </div>
      )}
    </div>
  )
}

ImageUploader.defaultProps = {
  onImageUpload: () => {},
  uploadedImage: null,
}
