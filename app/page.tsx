"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { KeyValidator } from "@/components/picmagic/key-validator"
import { ImageUploader } from "@/components/picmagic/image-uploader"
import { StyleSelector } from "@/components/picmagic/style-selector"
import { ResultDisplay } from "@/components/picmagic/result-display"
import { SupportModal } from "@/components/picmagic/support-modal"
import { ThemeToggle } from "@/components/theme-toggle"
import { PromptInput } from "@/components/picmagic/prompt-input"
import { useToast } from "@/hooks/use-toast"
import { Wand2, Upload, BrainCircuit, Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image" // 用于显示修改后的多张图片

export default function PicMagicPage() {
  const [apiKey, setApiKey] = useState<string>("")
  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null) // 原始图片文件
  const [uploadedCloudinaryUrl, setUploadedCloudinaryUrl] = useState<string | null>(null) // Cloudinary URL
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null)
  const [selectedPrompt, setSelectedPrompt] = useState<string>("") // 新增：图片修改提示词

  // 图像风格化状态
  const [stylizationStatus, setStylizationStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [stylizedImageUrl, setStylizedImageUrl] = useState<string | null>(null)
  const [stylizedImageUrls, setStylizedImageUrls] = useState<string[]>([]) // 新增：多张风格化图片
  const [stylizationErrorMessage, setStylizationErrorMessage] = useState<string | null>(null)

  // 图片修改状态
  const [imageModifyStatus, setImageModifyStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [modifiedImageUrls, setModifiedImageUrls] = useState<string[]>([])
  const [imageModifyErrorMessage, setImageModifyErrorMessage] = useState<string | null>(null)

  const [isUploading, setIsUploading] = useState(false) // 统一的上传状态
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false)
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("stylization") // 默认激活风格化选项卡

  // 右下角按钮控制 SupportModal
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false)

  // 处理图片文件上传到 Cloudinary
  const uploadFileToCloudinary = useCallback(async (file: File) => {
    setIsUploading(true)
    toast({ title: "图片上传中", description: "正在将您的图片上传到服务器..." })
    try {
      const formData = new FormData()
      formData.append("image", file)

      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "图片上传失败")
      }
      
      const imageUrl = data.imageUrl
      setUploadedCloudinaryUrl(imageUrl) // 设置 Cloudinary URL
      toast({ title: "图片上传成功", description: "图片已成功上传。" })
      return imageUrl

    } catch (error: any) {
      console.error("上传图片到 Cloudinary 失败:", error)
      toast({ 
        title: "图片上传失败", 
        description: error.message || "图片上传过程中发生错误，请重试。", 
        variant: "destructive" 
      })
      setUploadedCloudinaryUrl(null)
      return null
    } finally {
      setIsUploading(false)
    }
  }, [toast])

  const handleGenerate = async () => {
    if (!apiKey) {
      toast({ title: "未输入秘钥", description: "请先输入秘钥。", variant: "destructive" })
      return
    }
    if (!uploadedImageFile) {
      toast({ title: "未上传图片", description: "请先上传一张图片。", variant: "destructive" })
      return
    }
    if (!selectedStyle) {
      toast({ title: "未选择风格", description: "请选择一个图片风格。", variant: "destructive" })
      return
    }

    setStylizationStatus("loading")
    setStylizedImageUrl(null)
    setStylizedImageUrls([]) // 重置多张图片数组
    setStylizationErrorMessage(null)

    try {
      let finalImageUrl = uploadedCloudinaryUrl;

      // 如果还没有 Cloudinary URL，则先上传图片
      if (!finalImageUrl) {
        toast({ title: "准备生成图片", description: "正在上传图片并准备调用风格化API。" })
        finalImageUrl = await uploadFileToCloudinary(uploadedImageFile);
        if (!finalImageUrl) {
          throw new Error("图片上传到 Cloudinary 失败");
        }
      }

      // 2. 调用风格化API
      toast({ title: "正在生成图片...", description: "AI正在创作中，这可能需要一点时间。" })
      const response = await fetch("/api/stylize-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: finalImageUrl, // 现在传递 URL
          styleId: selectedStyle,
          apiKey: apiKey
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.message || "图片生成失败")
      }

      setStylizedImageUrl(data.previewUrl)
      setStylizedImageUrls(data.imageUrls || [data.previewUrl]) // 设置多张图片数组
      setStylizationStatus("success")
      toast({ 
        title: "生成成功！", 
        description: `图片已成功应用${data.style}风格。${data.imageUrls && data.imageUrls.length > 1 ? `生成了 ${data.imageUrls.length} 张图片。` : ''}` 
      })
    } catch (error: any) {
      console.error("图片生成错误:", error)
      setStylizationErrorMessage(error.message || "图片生成过程中发生错误")
      setStylizationStatus("error")
      toast({ 
        title: "生成失败", 
        description: error.message || "图片生成失败，请重试。", 
        variant: "destructive" 
      })
    }
  }

  const handleImageModify = async () => {
    if (!uploadedImageFile) {
      toast({ title: "未上传图片", description: "请先上传一张图片。", variant: "destructive" })
      return
    }
    if (!selectedPrompt) {
      toast({ title: "未输入修改提示", description: "请输入图片修改的提示词。", variant: "destructive" })
      return
    }

    setImageModifyStatus("loading")
    setModifiedImageUrls([])
    setImageModifyErrorMessage(null)

    try {
      let finalImageUrl = uploadedCloudinaryUrl;

      // 如果还没有 Cloudinary URL，则先上传图片
      if (!finalImageUrl) {
        toast({ title: "准备修改图片", description: "正在上传图片并准备调用修改API。" })
        finalImageUrl = await uploadFileToCloudinary(uploadedImageFile);
        if (!finalImageUrl) {
          throw new Error("图片上传到 Cloudinary 失败");
        }
      }

      toast({ title: "正在修改图片...", description: "AI正在根据您的提示词修改图片，这可能需要一点时间。" })
      const response = await fetch("/api/chat-image-modify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: finalImageUrl,
          promptText: selectedPrompt,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.details || data.message || "图片修改失败")
      }

      if (data.modifiedImageUrls && Array.isArray(data.modifiedImageUrls)) {
        setModifiedImageUrls(data.modifiedImageUrls)
        setImageModifyStatus("success")
        toast({ title: "图片修改成功！", description: "您的图片已成功修改。" })
      } else {
        throw new Error("API 响应格式不正确，未找到图片 URL。")
      }

    } catch (error: any) {
      console.error("图片修改错误:", error)
      setImageModifyErrorMessage(error.message || "图片修改过程中发生错误")
      setImageModifyStatus("error")
      toast({ 
        title: "图片修改失败", 
        description: error.message || "图片修改失败，请重试。", 
        variant: "destructive" 
      })
    }
  }

  const handleDownload = async () => {
    // 此下载逻辑仅适用于风格化图片，图片修改通常直接返回 URL
    if (activeTab === "image-modify") {
      toast({ title: "提示", description: "图片修改功能直接返回URL，无需额外下载。", variant: "default" })
      return;
    }

    if (!stylizedImageUrl) {
      toast({ title: "无法下载", description: "请先生成预览图片。", variant: "destructive" })
      return
    }

    try {
      setStylizationStatus("loading")
      const response = await fetch("/api/download-stylized", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imagePath: uploadedImageFile,
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
      setStylizationStatus("success")
    }
  }

  return (
    <div className="relative min-h-screen bg-background">
      {/* 右下角"购买与客服"按钮 */}
      <button
        className="fixed bottom-6 right-6 z-50 bg-primary text-primary-foreground px-5 py-3 rounded-full shadow-lg hover:bg-primary/90 transition-colors"
        onClick={() => setIsBuyModalOpen(true)}
      >
        购买与客服
      </button>
      {/* 购买与客服弹窗 */}
      <SupportModal isOpen={isBuyModalOpen} onOpenChange={setIsBuyModalOpen} />
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <KeyValidator
            apiKey={apiKey}
            setApiKey={setApiKey}
            onOpenSupportModal={() => setIsBuyModalOpen(true)}
          />
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <Tabs defaultValue="stylization" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="stylization">图像风格化</TabsTrigger>
            <TabsTrigger value="image-modify">图片修改</TabsTrigger>
          </TabsList>

          <TabsContent value="stylization">
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="card p-6 bg-card">
                  <ImageUploader onImageUpload={setUploadedImageFile} uploadedImage={uploadedImageFile} />
                </div>
                <div className="card p-6 bg-card">
                  <StyleSelector selectedStyle={selectedStyle} onStyleSelect={setSelectedStyle} />
                </div>
                <Button
                  onClick={handleGenerate}
                  disabled={
                    stylizationStatus === "loading" || 
                    isUploading || 
                    !uploadedImageFile || 
                    !selectedStyle
                  }
                  className="w-full py-6 text-lg button-primary"
                  size="lg"
                >
                  {isUploading ? <Upload className="mr-2 h-5 w-5 animate-pulse" /> : <Wand2 className="mr-2 h-5 w-5" />}
                  {isUploading ? "上传中..." : stylizationStatus === "loading" ? "生成中..." : "生成预览"}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  ⚠️ 预览效果仅供参考，下载高清图片需要验证秘钥。
                </p>
              </div>

              <div className="sticky top-4">
                <ResultDisplay
                  status={stylizationStatus}
                  imageUrl={stylizedImageUrl}
                  imageUrls={stylizedImageUrls}
                  errorMessage={stylizationErrorMessage}
                  onRetry={handleGenerate}
                  onDownload={handleDownload}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="image-modify">
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="card p-6 bg-card">
                  <ImageUploader onImageUpload={setUploadedImageFile} uploadedImage={uploadedImageFile} />
                </div>
                <div className="card p-6 bg-card">
                  <PromptInput selectedPrompt={selectedPrompt} onPromptChange={setSelectedPrompt} />
                </div>
                <Button
                  onClick={handleImageModify}
                  disabled={
                    imageModifyStatus === "loading" || 
                    isUploading || 
                    !uploadedImageFile || 
                    !selectedPrompt
                  }
                  className="w-full py-6 text-lg button-primary"
                  size="lg"
                >
                  {isUploading ? <Upload className="mr-2 h-5 w-5 animate-pulse" /> : <BrainCircuit className="mr-2 h-5 w-5" />}
                  {isUploading ? "上传中..." : imageModifyStatus === "loading" ? "修改中..." : "修改图片"}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  您可以根据提示词修改图片。
                </p>
              </div>

              <div className="sticky top-4">
                {imageModifyStatus === "loading" && (
                  <div className="flex flex-col items-center justify-center h-full min-h-[300px] bg-muted/40 rounded-lg">
                    <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                    <p className="text-muted-foreground">AI 正在努力修改图片...</p>
                  </div>
                )}
                {imageModifyStatus === "error" && imageModifyErrorMessage && (
                  <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex flex-col items-center justify-center h-full min-h-[300px]">
                    <p className="font-semibold mb-2">错误！</p>
                    <p className="text-center">{imageModifyErrorMessage}</p>
                    <Button onClick={handleImageModify} variant="outline" className="mt-4">重试</Button>
                  </div>
                )}
                {imageModifyStatus === "success" && modifiedImageUrls.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold">修改结果预览</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {modifiedImageUrls.map((url, index) => (
                        <div key={index} className="relative aspect-square rounded-md overflow-hidden border">
                          <Image src={url} alt={`修改结果 ${index + 1}`} layout="fill" objectFit="contain" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                 {imageModifyStatus === "success" && modifiedImageUrls.length === 0 && (
                  <div className="p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg flex flex-col items-center justify-center h-full min-h-[300px]">
                    <p className="font-semibold mb-2">提示！</p>
                    <p className="text-center">图片修改请求成功，但响应中未找到修改后的图片URL。请检查控制台输出。</p>
                    <Button onClick={handleImageModify} variant="outline" className="mt-4">重试</Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <SupportModal isOpen={isSupportModalOpen} onOpenChange={setIsSupportModalOpen} />
    </div>
  )
}
