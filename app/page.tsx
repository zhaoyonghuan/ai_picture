"use client"

import { useState, useCallback, useEffect, useRef } from "react"
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
import { useTheme } from "next-themes"

type StylizationStatus = "idle" | "loading" | "polling" | "success" | "error"

export default function PicMagicPage() {
  const [apiKey, setApiKey] = useState<string>("")
  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null) // 原始图片文件
  const [uploadedCloudinaryUrl, setUploadedCloudinaryUrl] = useState<string | null>(null) // Cloudinary URL
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null)
  const [customStyleValue, setCustomStyleValue] = useState<string>("")
  const [selectedPrompt, setSelectedPrompt] = useState<string>("") // 新增：图片修改提示词

  // 图像风格化状态
  const [stylizationStatus, setStylizationStatus] = useState<StylizationStatus>("idle")
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

  // 新增：用于跟踪轮询的定时器和任务ID
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);

  // 当组件卸载时，清除任何正在进行的轮询
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  // 处理图片文件上传到 Cloudinary
  const uploadFileToCloudinary = useCallback(async (file: File) => {
    setIsUploading(true)
    toast({ title: "正在努力生成", description: "请稍候，正在上传并处理您的图片..." })
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
      toast({ title: "图片准备就绪", description: "已准备好，请点击生成。" })
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
    console.log("=== 前端 handleGenerate 开始 ===");
    console.log("当前状态:");
    console.log("- apiKey:", apiKey ? `已设置 (${apiKey.slice(0, 8)}...${apiKey.slice(-4)})` : "undefined");
    console.log("- apiKey 长度:", apiKey ? apiKey.length : 0);
    console.log("- uploadedImageFile:", uploadedImageFile ? "已上传" : "未上传");
    console.log("- selectedStyle:", selectedStyle);
    console.log("- customStyleValue:", customStyleValue);

    if (!apiKey) {
      console.error("❌ 前端验证失败: 未输入秘钥");
      toast({ title: "未输入秘钥", description: "请先输入秘钥。", variant: "destructive" })
      return
    }
    if (!uploadedImageFile) {
      console.error("❌ 前端验证失败: 未上传图片");
      toast({ title: "未上传图片", description: "请先上传一张图片。", variant: "destructive" })
      return
    }
    if (!selectedStyle) {
      console.error("❌ 前端验证失败: 未选择风格");
      toast({ title: "未选择风格", description: "请选择一个图片风格或输入自定义风格。", variant: "destructive" })
      return
    }

    const finalStyle = selectedStyle === 'custom' ? customStyleValue : selectedStyle

    if (!finalStyle) {
      console.error("❌ 前端验证失败: 最终风格为空");
      toast({ title: "未选择风格", description: "请选择一个图片风格或输入自定义风格。", variant: "destructive" })
      return
    }

    console.log("✅ 前端验证通过，最终风格:", finalStyle);

    setStylizationStatus("loading")
    setStylizedImageUrl(null)
    setStylizedImageUrls([])
    setStylizationErrorMessage(null)
    setCurrentTaskId(null);
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    try {
      let finalImageUrl = uploadedCloudinaryUrl;

      // 如果还没有 Cloudinary URL，则先上传图片
      if (!finalImageUrl) {
        console.log("📤 准备上传图片到 Cloudinary...");
        toast({ title: "准备生成图片", description: "正在上传图片并准备调用风格化API。" })
        finalImageUrl = await uploadFileToCloudinary(uploadedImageFile);
        if (!finalImageUrl) {
          throw new Error("图片上传到 Cloudinary 失败");
        }
        console.log("✅ 图片上传成功:", finalImageUrl ? `${finalImageUrl.substring(0, 50)}...` : "undefined");
      } else {
        console.log("✅ 使用已上传的图片URL:", finalImageUrl ? `${finalImageUrl.substring(0, 50)}...` : "undefined");
      }

      // 1. 调用主 API，获取 taskId
      console.log("🚀 准备调用 /api/stylize-image...");
      console.log("请求参数:");
      console.log("- imageUrl:", finalImageUrl ? `${finalImageUrl.substring(0, 50)}...` : "undefined");
      console.log("- style:", finalStyle);
      console.log("- provider:", "aicomfly");
      console.log("- apiKey:", apiKey ? `已设置 (${apiKey.slice(0, 8)}...${apiKey.slice(-4)})` : "undefined");

      toast({ title: "正在创建任务...", description: "正在向服务器提交生成任务。" })
      const response = await fetch("/api/stylize-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: finalImageUrl,
          style: finalStyle,
          provider: "aicomfly",
          apiKey: apiKey
        }),
      });

      console.log("📡 /api/stylize-image 响应状态:", response.status, response.statusText);

      const data = await response.json();
      console.log("📄 /api/stylize-image 响应数据:", data);

      if (!response.ok) {
        console.error("❌ /api/stylize-image 请求失败:", data);
        throw new Error(data.details || data.error || data.message || "创建任务失败");
      }

      if (!data.taskId) {
        console.error("❌ 响应中缺少 taskId:", data);
        throw new Error("未能从服务器获取任务ID");
      }
      
      const { taskId } = data;
      console.log("✅ 成功获取任务ID:", taskId);
      setCurrentTaskId(taskId);
      setStylizationStatus("polling");
      toast({ title: "任务已提交", description: `任务ID: ${taskId}，正在排队等待处理...` });

      // 2. 开始轮询结果
      console.log("🔄 开始轮询任务结果...");
      pollForResult(taskId);

    } catch (error: any) {
      console.error("❌ 图片生成任务创建错误:", error);
      console.error("错误详情:", error.message);
      console.error("错误堆栈:", error.stack);
      setStylizationErrorMessage(error.message || "图片生成任务创建时发生错误");
      setStylizationStatus("error");
      toast({ 
        title: "任务创建失败", 
        description: error.message || "无法创建生成任务，请重试。", 
        variant: "destructive" 
      });
    }
  }

  // 新增：轮询函数
  const pollForResult = (taskId: string) => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    
    const startTime = Date.now();
    const maxPollTime = 5 * 60 * 1000; // 5分钟超时

    pollIntervalRef.current = setInterval(async () => {
      if (Date.now() - startTime > maxPollTime) {
        setStylizationErrorMessage("任务处理超时，请稍后重试。");
        setStylizationStatus("error");
        toast({ title: "任务超时", description: "等待图片生成结果超时（5分钟）。", variant: "destructive" });
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        return;
      }

      try {
        const response = await fetch(`/api/stylize-image-status?taskId=${taskId}`);
        if (!response.ok) {
          // 如果API本身返回错误（比如500），则停止轮询
          throw new Error(`状态查询失败: ${response.statusText}`);
        }
        
        const data = await response.json();

        if (data.status === 'completed' || data.status === 'succeeded') { // 兼容 succeeded
          const resultUrl = data.result?.stylizedImageUrl || data.result?.resultUrl;
          if (!resultUrl) throw new Error('任务完成，但未返回图片地址');

          setStylizedImageUrl(resultUrl);
          setStylizedImageUrls([resultUrl]); // 假设只返回一张图片
          setStylizationStatus("success");
          toast({ 
            title: "生成成功！", 
            description: `图片已成功生成。`
          });
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

        } else if (data.status === 'failed') {
          setStylizationErrorMessage(data.error || "任务处理失败，未知错误。");
          setStylizationStatus("error");
          toast({ title: "生成失败", description: data.error || "后台任务处理失败。", variant: "destructive" });
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        
        } else {
          // 状态为 pending, processing, 或其他中间状态，继续轮询
          console.log(`任务 ${taskId} 状态: ${data.status}, 继续轮询...`);
        }
      } catch (error: any) {
        setStylizationErrorMessage(error.message);
        setStylizationStatus("error");
        toast({ title: "轮询错误", description: error.message, variant: "destructive" });
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      }
    }, 3000); // 每3秒查询一次
  }

  const handleImageModify = async () => {
    if (!apiKey) {
      toast({ title: "未输入秘钥", description: "请先输入秘钥。", variant: "destructive" })
      return
    }
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

      toast({ title: "正在努力生成...", description: "AI正在根据您的提示词修改图片，这可能需要一点时间。" })
      const response = await fetch("/api/chat-image-modify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: finalImageUrl,
          promptText: selectedPrompt,
          apiKey: apiKey
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
      // 直接下载图片
      const link = document.createElement("a")
      link.href = stylizedImageUrl
      link.download = `picmagic_stylized_${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast({ title: "下载成功", description: "图片已开始下载" })
    } catch (error: any) {
      console.error("下载错误:", error)
      toast({ 
        title: "下载失败", 
        description: error.message || "下载过程中发生错误，请重试。", 
        variant: "destructive" 
      })
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
        <div className="w-full">
          {/* 只保留风格化内容 */}
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="flex flex-col gap-2">
              <div className="card bg-card">
                <ImageUploader onImageUpload={setUploadedImageFile} uploadedImage={uploadedImageFile} />
              </div>
              <div className="card bg-card">
                <StyleSelector 
                  selectedStyle={selectedStyle} 
                  onStyleSelect={setSelectedStyle} 
                  customStyleValue={customStyleValue}
                  onCustomStyleChange={setCustomStyleValue}
                />
              </div>
              <Button
                onClick={handleGenerate}
                disabled={
                  stylizationStatus === "loading" ||
                  stylizationStatus === "polling" ||
                  isUploading ||
                  !uploadedImageFile ||
                  !selectedStyle
                }
                className="w-full py-6 text-lg button-primary"
                size="lg"
              >
                {isUploading ? <Upload className="mr-2 h-5 w-5 animate-pulse" /> : <Wand2 className="mr-2 h-5 w-5" />}
                {isUploading ? "上传中..." : stylizationStatus === "loading" ? "创建任务中..." : stylizationStatus === "polling" ? "处理中，请稍候..." : "生成图片"}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                图片生成可能需要1-3分钟，请耐心等待
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
        </div>
      </main>

      <SupportModal isOpen={isSupportModalOpen} onOpenChange={setIsSupportModalOpen} />
    </div>
  )
}
