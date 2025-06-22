"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, ImageIcon, AlertTriangle, RotateCcw, Loader2, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react"
import NextImage from "next/image" // Renamed to avoid conflict with Lucide's Image
import { useState } from "react"

export interface ResultDisplayProps {
  status: "idle" | "loading" | "polling" | "success" | "error"
  imageUrl?: string | null
  imageUrls?: string[] // 新增：支持多张图片
  errorMessage?: string | null
  onRetry?: () => void
  onDownload?: () => void
}

export function ResultDisplay({ status, imageUrl, imageUrls, errorMessage, onRetry, onDownload }: ResultDisplayProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // 确定要显示的图片数组
  const displayImages = imageUrls && imageUrls.length > 0 ? imageUrls : (imageUrl ? [imageUrl] : []);
  const currentImage = displayImages[currentImageIndex];
  const hasMultipleImages = displayImages.length > 1;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  const downloadCurrentImage = () => {
    if (currentImage) {
      const link = document.createElement('a');
      link.href = currentImage;
      link.download = `stylized-image-${currentImageIndex + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>生成结果</CardTitle>
        <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full">
          {hasMultipleImages ? `图片 ${currentImageIndex + 1}/${displayImages.length}` : "预览效果"}
        </span>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col items-center justify-center text-center p-6">
        {status === "idle" && (
          <div className="space-y-2 text-muted-foreground">
            <ImageIcon className="mx-auto h-16 w-16" />
            <p className="font-medium">您的生成结果将显示在这里</p>
            <p className="text-sm">上传图片并选择风格后开始</p>
          </div>
        )}
        {status === "loading" && (
          <div className="space-y-2">
            <Loader2 className="mx-auto h-16 w-16 animate-spin text-primary" />
            <p className="font-medium">正在生成中，请稍候...</p>
          </div>
        )}
        {status === "polling" && (
          <div className="space-y-2">
            <RefreshCw className="mx-auto h-16 w-16 animate-spin text-primary" />
            <p className="font-medium">正在处理中，请稍候...</p>
            <p className="text-sm text-muted-foreground">后台正在处理您的图片</p>
          </div>
        )}
        {status === "success" && currentImage && (
          <div className="space-y-4 w-full">
            <div className="relative aspect-square w-full max-w-md mx-auto">
              <img
                src={currentImage}
                alt="风格化图片"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            {hasMultipleImages && (
              <div className="flex justify-center space-x-2">
                <Button variant="outline" size="sm" onClick={prevImage}>
                  上一张
                </Button>
                <Button variant="outline" size="sm" onClick={nextImage}>
                  下一张
                </Button>
              </div>
            )}
            <div className="flex justify-center space-x-2">
              <Button onClick={downloadCurrentImage} className="flex items-center">
                <Download className="mr-2 h-4 w-4" />
                下载图片
              </Button>
            </div>
          </div>
        )}
        {status === "error" && (
          <div className="space-y-4">
            <div className="space-y-2 text-destructive">
              <ImageIcon className="mx-auto h-16 w-16" />
              <p className="font-medium">生成失败</p>
              {errorMessage && (
                <p className="text-sm text-muted-foreground max-w-xs">{errorMessage}</p>
              )}
            </div>
            {onRetry && (
              <Button onClick={onRetry} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                重试
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

ResultDisplay.defaultProps = {
  status: "idle",
  imageUrl: null,
  imageUrls: [],
  errorMessage: null,
  onRetry: () => {},
  onDownload: () => {},
}
