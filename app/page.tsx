"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { KeyValidator } from "@/components/picmagic/key-validator"
import { ImageUploader } from "@/components/picmagic/image-uploader"
import { StyleSelector } from "@/components/picmagic/style-selector"
import { ResultDisplay } from "@/components/picmagic/result-display"
import { SupportModal } from "@/components/picmagic/support-modal"
import { ThemeToggle } from "@/components/theme-toggle"
import { useToast } from "@/hooks/use-toast" // 确保路径正确
import { Wand2, Upload } from "lucide-react" // Added Upload icon for clarity if needed

export default function PicMagicPage() {
  const [apiKey, setApiKey] = useState<string>("")
  const [isKeyValid, setIsKeyValid] = useState<boolean | null>(null)
  const [uploadedImage, setUploadedImage] = useState<File | null>(null)
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null)

  const [generationStatus, setGenerationStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false) // New state for upload status

  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false)
  const { toast } = useToast()

  const handleGenerate = async () => {
    if (!uploadedImage) {
      toast({ title: "未上传图片", description: "请先上传一张图片。", variant: "destructive" })
      return
    }
    if (!selectedStyle) {
      toast({ title: "未选择风格", description: "请选择一个图片风格。", variant: "destructive" })
      return
    }

    setGenerationStatus("loading")
    setGeneratedImageUrl(null)
    setErrorMessage(null)
    setIsUploading(true)

    try {
      // 1. 将图片转换为base64并进行缩放
      const reader = new FileReader()
      const imageBase64 = await new Promise<string>((resolve, reject) => {
        reader.onload = (event) => {
          const img = new Image()
          img.onload = () => {
            const MAX_PIXELS = 2250000 // Modelslab API 限制
            let { width, height } = img

            if (width * height > MAX_PIXELS) {
              const aspectRatio = width / height
              if (width > height) {
                width = Math.sqrt(MAX_PIXELS * aspectRatio)
                height = MAX_PIXELS / width
              } else {
                height = Math.sqrt(MAX_PIXELS / aspectRatio)
                width = MAX_PIXELS / height
              }
              // 确保整数像素值
              width = Math.round(width)
              height = Math.round(height)
            }

            const canvas = document.createElement('canvas')
            canvas.width = width
            canvas.height = height
            const ctx = canvas.getContext('2d')
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height)
              resolve(canvas.toDataURL('image/png')) // 统一使用PNG格式
            } else {
              reject(new Error('无法获取Canvas上下文'))
            }
          }
          img.onerror = reject
          img.src = event.target?.result as string
        }
        reader.onerror = reject
        reader.readAsDataURL(uploadedImage)
      })

      // 2. 调用风格化API
      toast({ title: "正在生成图片...", description: "AI正在创作中，这可能需要一点时间。" })
      const response = await fetch("/api/stylize-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imagePath: imageBase64,
          styleId: selectedStyle,
          apiKey: apiKey
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "图片生成失败")
      }

      setGeneratedImageUrl(data.previewUrl)
      setGenerationStatus("success")
      toast({ 
        title: "生成成功！", 
        description: `图片已成功应用${data.style}风格。` 
      })
    } catch (error: any) {
      console.error("图片生成错误:", error)
      setErrorMessage(error.message || "图片生成过程中发生错误")
      setGenerationStatus("error")
      toast({ 
        title: "生成失败", 
        description: error.message || "图片生成失败，请重试。", 
        variant: "destructive" 
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDownload = async () => {
    if (!isKeyValid) {
      toast({ title: "需要秘钥", description: "下载高清图片需要验证有效的秘钥。", variant: "destructive" })
      setIsSupportModalOpen(true)
      return
    }

    if (!generatedImageUrl) {
      toast({ title: "无法下载", description: "请先生成预览图片。", variant: "destructive" })
      return
    }

    try {
      setGenerationStatus("loading")
      const response = await fetch("/api/download-stylized", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imagePath: uploadedImage,
          neuralStyleId: selectedStyle,
          apiKey: apiKey
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "下载失败")
      }

      // 下载图片
      const link = document.createElement("a")
      link.href = data.stylizedImageUrl
      link.download = `picmagic_stylized_${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast({ title: "下载成功", description: "高清图片已开始下载" })
    } catch (error: any) {
      console.error("下载错误:", error)
      toast({ 
        title: "下载失败", 
        description: error.message || "下载过程中发生错误，请重试。", 
        variant: "destructive" 
      })
    } finally {
      setGenerationStatus("success")
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <KeyValidator
            apiKey={apiKey}
            setApiKey={setApiKey}
            isKeyValid={isKeyValid}
            setIsKeyValid={setIsKeyValid}
            onOpenSupportModal={() => setIsSupportModalOpen(true)}
          />
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="card p-6 bg-card">
              <ImageUploader onImageUpload={setUploadedImage} uploadedImage={uploadedImage} />
            </div>
            <div className="card p-6 bg-card">
              <StyleSelector selectedStyle={selectedStyle} onStyleSelect={setSelectedStyle} />
            </div>
            <Button
              onClick={handleGenerate}
              disabled={
                generationStatus === "loading" || 
                isUploading || 
                !uploadedImage || 
                !selectedStyle
              }
              className="w-full py-6 text-lg button-primary"
              size="lg"
            >
              {isUploading ? <Upload className="mr-2 h-5 w-5 animate-pulse" /> : <Wand2 className="mr-2 h-5 w-5" />}
              {isUploading ? "上传中..." : generationStatus === "loading" ? "生成中..." : "生成预览"}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              ⚠️ 预览效果仅供参考，下载高清图片需要验证秘钥。
            </p>
          </div>

          <div className="sticky top-4">
            <ResultDisplay
              status={generationStatus}
              imageUrl={generatedImageUrl}
              errorMessage={errorMessage}
              onRetry={handleGenerate}
              onDownload={handleDownload}
            />
          </div>
        </div>
      </main>

      <SupportModal isOpen={isSupportModalOpen} onOpenChange={setIsSupportModalOpen} />
    </div>
  )
}
